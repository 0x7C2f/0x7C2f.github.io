/*  audio-reactor.js
 *  Music-reactive driver for PavelDoGreat/WebGL-Fluid-Simulation.
 *  Maps a live audio spectrum (mic / file / built-in demo beat) onto
 *  fluid splats, colours, bloom and vorticity.
 *
 *  Exposes window.FluidAudio with: tick(dt), demo(), enableMic(),
 *  openFilePicker(), loadFile(file), loadURL(url), stop(), resume(), suspend()
 */
(function () {
    'use strict';

    const clamp = (v, lo, hi) => v < lo ? lo : (v > hi ? hi : v);
    const lerp = (a, b, t) => a + (b - a) * t;
    const now = () => performance.now() * 0.001;

    /* Track clock. In offline/render mode `performance.now()` runs at whatever
     * speed the GPU manages, which made the 210 ms beat refractory fire on
     * render time instead of music time — beats were silently throttled. */
    const clock = () => (OFFLINE.ready && OFFLINE.rendering) ? OFFLINE.time : now();
    const F = () => window.__FLUID__;

    /* ------------------------------------------------------------------ *
     *  band layout  (Hz ranges, weight when summing into "level")
     * ------------------------------------------------------------------ */
    const BANDS = [
        // ref  = typical loud level in dBFS for this band (maps to 1.0)
        // span = dB range below ref that maps to 0.0
        { key: 'sub',    from: 20,    to: 60,    weight: 1.00, ref: -24, span: 30, attack: 0.015, release: 0.16 },
        { key: 'bass',   from: 60,    to: 160,   weight: 1.00, ref: -27, span: 30, attack: 0.015, release: 0.18 },
        { key: 'lowMid', from: 160,   to: 500,   weight: 0.85, ref: -31, span: 28, attack: 0.020, release: 0.20 },
        { key: 'mid',    from: 500,   to: 2000,  weight: 0.70, ref: -36, span: 28, attack: 0.020, release: 0.20 },
        { key: 'high',   from: 2000,  to: 6000,  weight: 0.55, ref: -45, span: 28, attack: 0.015, release: 0.22 },
        { key: 'treble', from: 6000,  to: 16000, weight: 0.45, ref: -60, span: 30, attack: 0.015, release: 0.22 },
    ];

    const state = {
        ctx: null,
        analyser: null,
        freq: null,          // Uint8Array of dB-ish magnitudes
        binHz: 0,
        mode: 'off',         // off | mic | file | demo | paused
        masterGain: null,
        mediaEl: null,
        mediaSource: null,
        micStream: null,
        fileURL: null,
        name: '',

        /* smoothed band energies 0..1 (absolute loudness, calibrated dBFS) */
        env: { sub: 0, bass: 0, lowMid: 0, mid: 0, high: 0, treble: 0 },
        /* slow loudness reference + transient novelty per band */
        slow: { sub: 0, bass: 0, lowMid: 0, mid: 0, high: 0, treble: 0 },
        nov: { sub: 0, bass: 0, lowMid: 0, mid: 0, high: 0, treble: 0 },
        novRaw: { sub: 0, bass: 0, lowMid: 0, mid: 0, high: 0, treble: 0 },
        armed: true,
        prevInstant: 0,
        transient: null,
        transientMid: 0,
        fluxHist: [],
        freqDb: null,
        level: 0,   // absolute loudness 0..1
        dyn: 0,     // how much the music is *changing* right now 0..1

        /* beat tracking */
        hist: [],
        fluxAvg: 0,
        lastBeatAt: -10,
        beat: 0,             // 0..1 decaying pulse
        beatCount: 0,
        bpm: 0,
        beatTimes: [],

        /* look */
        hue: Math.random(),
        hueDrift: 0,
        t: 0,

        /* demo sequencer */
        demo: null,
        noiseBuf: null,

        autoStarted: false,
        tokens: 1.0,
        waveT: 0,
        dyeTok: 2.0,   // dye token bucket (units)
        velTok: 6000,  // velocity token bucket (units)
        lastReal: 0,
    };

    /* ------------------------------------------------------------------ *
     *  Cover palette — sampled from the Aftershock artwork
     *  (03 Releases/Aftershock/Cover/Original): midnight base, crimson ->
     *  scarlet -> tangerine -> amber -> ivory light trails, with a sparse
     *  ice-cyan accent from the distant city lights.
     * ------------------------------------------------------------------ */
    function hexToRgb (hex) {
        const n = parseInt(hex.replace('#', ''), 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }

    const COVER_RAMP = [
        '#05070E',   // 0.00 midnight
        '#3A0A12',   // 0.17 shadow crimson
        '#7A0B16',   // 0.34 deep crimson
        '#992224',   // 0.50 scarlet
        '#E11D2E',   // 0.65 neon red
        '#FF6A1A',   // 0.78 tangerine
        '#FFB23E',   // 0.89 amber
        '#F4E8D2',   // 1.00 ivory highlight
    ].map(hexToRgb);

    const COVER_ACCENT = hexToRgb('#65D8E8');   // ice cyan city lights

    /** sample the artwork ramp (0..1) with linear interpolation */
    function rampColor (t) {
        t = clamp(t, 0, 1);
        const n = COVER_RAMP.length - 1;
        const x = t * n;
        const i = Math.min(n - 1, Math.floor(x));
        const f = x - i;
        const a = COVER_RAMP[i], b = COVER_RAMP[i + 1];
        return { r: a[0] + (b[0] - a[0]) * f, g: a[1] + (b[1] - a[1]) * f, b: a[2] + (b[2] - a[2]) * f };
    }

    /* ------------------------------------------------------------------ *
     *  colour helpers
     * ------------------------------------------------------------------ */
    /** base colour helper.
     *  With the cover palette on, `t` selects a position along the artwork
     *  ramp instead of a hue, so every splat is drawn from Aftershock's own
     *  crimson -> amber -> ivory gradient. `accent` swaps in the ice cyan. */
    function audioColor (t, s, v, mag, accent) {
        const F_ = F();

        const usePalette = !F_ || F_.config.PALETTE_COVER !== false;
        let c;
        if (usePalette) {
            c = accent
                ? { r: COVER_ACCENT[0], g: COVER_ACCENT[1], b: COVER_ACCENT[2] }
                : rampColor(t);
            // keep a little tonal variety without leaving the artwork palette
            const k = 0.85 + 0.15 * clamp(v, 0, 1);
            c.r *= k; c.g *= k; c.b *= k;
            c.r *= mag; c.g *= mag; c.b *= mag;
            return c;
        }
        c = F_ ? F_.HSVtoRGB(((t % 1) + 1) % 1, clamp(s, 0, 1), clamp(v, 0, 1))
               : { r: v, g: v, b: v };
        c.r *= mag; c.g *= mag; c.b *= mag;
        return c;
    }

    /* ------------------------------------------------------------------ *
     *  audio graph
     * ------------------------------------------------------------------ */
    function ensureContext() {
        if (state.ctx) {
            if (state.ctx.state === 'suspended') state.ctx.resume();
            return state.ctx;
        }
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC({ latencyHint: 'interactive' });
        state.ctx = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 4096;
        analyser.minDecibels = -95;
        analyser.maxDecibels = -12;
        analyser.smoothingTimeConstant = 0.72;
        state.analyser = analyser;
        state.freq = new Uint8Array(analyser.frequencyBinCount);
        state.freqDb = new Float32Array(analyser.frequencyBinCount);
        state.binHz = ctx.sampleRate / analyser.fftSize;

        // audible path for file / demo playback
        state.masterGain = ctx.createGain();
        state.masterGain.gain.value = 1.0;
        analyser.connect(state.masterGain);
        state.masterGain.connect(ctx.destination);
        return ctx;
    }

    function detachSource() {
        if (state.mediaSource) { try { state.mediaSource.disconnect(); } catch (e) {} state.mediaSource = null; }
        if (state.micStream) {
            state.micStream.getTracks().forEach(t => t.stop());
            state.micStream = null;
        }
    }

    function stopDemoSequencer() {
        const d = state.demo;
        if (!d) return;
        clearInterval(d.timer);
        try { d.bus.disconnect(); } catch (e) {}
        state.demo = null;
    }

    function stop() {
        stopDemoSequencer();
        detachSource();
        if (state.mediaEl) {
            state.mediaEl.pause();
            state.mediaEl.removeAttribute('src');
            state.mediaEl.load();
            state.mediaEl = null;
        }
        if (state.fileURL) { URL.revokeObjectURL(state.fileURL); state.fileURL = null; }
        state.mode = 'off';
        state.name = '';
        state.beat = 0;
        state.level = 0;
        hud.update();
    }

    function suspend() {
        if (state.ctx) state.ctx.suspend();
        if (state.demo) state.demo.bus.gain.value = 0;
        if (state.mediaEl) state.mediaEl.pause();
        hud.update();
    }

    function resume() {
        if (!state.ctx) { if (state.mode === 'off') demo(); return; }
        state.ctx.resume();
        if (state.demo) state.demo.bus.gain.value = 0.9;
        if (state.mediaEl) state.mediaEl.play().catch(() => {});
        hud.update();
    }

    /* ------------------------------------------------------------------ *
     *  sources
     * ------------------------------------------------------------------ */
    function enableMic() {
        ensureContext();
        stopDemoSequencer();
        detachSource();
        if (state.mediaEl) state.mediaEl.pause();

        navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        }).then(stream => {
            state.micStream = stream;
            const src = state.ctx.createMediaStreamSource(stream);
            src.connect(state.analyser);
            state.mediaSource = src;
            state.masterGain.gain.value = 0.0;   // never monitor the mic -> no feedback
            state.mode = 'mic';
            state.name = 'microphone';
            hud.update();
        }).catch(err => {
            console.warn('[FluidAudio] mic denied:', err && err.name);
            hud.flash('microphone blocked — falling back to demo beat');
            demo();
        });
    }

    function loadFile(file) {
        if (!file) return;
        ensureContext();
        stopDemoSequencer();
        detachSource();

        if (state.fileURL) URL.revokeObjectURL(state.fileURL);
        state.fileURL = URL.createObjectURL(file);

        if (!state.mediaEl) {
            const el = document.createElement('audio');
            el.crossOrigin = 'anonymous';
            el.loop = true;
            el.preload = 'auto';
            state.mediaEl = el;
        }
        state.mediaEl.src = state.fileURL;
        state.mediaEl.play().catch(() => {});
        wireMediaElement();
        state.mode = 'file';
        state.name = file.name.replace(/\.[^.]+$/, '');
        hud.update();
    }

    function loadURL(url, label) {
        ensureContext();
        stopDemoSequencer();
        detachSource();
        if (!state.mediaEl) {
            const el = document.createElement('audio');
            el.crossOrigin = 'anonymous';
            el.loop = true;
            el.preload = 'auto';
            state.mediaEl = el;
        }
        state.mediaEl.src = url;
        state.mediaEl.play().catch(() => {});
        wireMediaElement();
        state.mode = 'file';
        state.name = label || url.split('/').pop();
        hud.update();
    }

    function wireMediaElement() {
        if (state.mediaSource) return;
        try {
            state.mediaSource = state.ctx.createMediaElementSource(state.mediaEl);
            state.mediaSource.connect(state.analyser);
            state.masterGain.gain.value = 1.0;
        } catch (e) {
            // element already bound to another context — recreate the element
            const el = document.createElement('audio');
            el.crossOrigin = 'anonymous';
            el.loop = true;
            el.src = state.mediaEl.src;
            state.mediaEl = el;
            state.mediaSource = state.ctx.createMediaElementSource(el);
            state.mediaSource.connect(state.analyser);
            state.masterGain.gain.value = 1.0;
            el.play().catch(() => {});
        }
    }

    function openFilePicker() {
        let input = document.getElementById('fluid-audio-input');
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.accept = 'audio/*,video/*';
            input.id = 'fluid-audio-input';
            input.style.display = 'none';
            input.addEventListener('change', e => {
                if (e.target.files && e.target.files[0]) loadFile(e.target.files[0]);
            });
            document.body.appendChild(input);
        }
        input.click();
    }

    /* ------------------------------------------------------------------ *
     *  built-in demo beat — a tiny generative track so the visualiser is
     *  alive with zero external assets or permissions.
     * ------------------------------------------------------------------ */
    function makeNoiseBuffer(ctx) {
        if (state.noiseBuf) return state.noiseBuf;
        const len = Math.floor(ctx.sampleRate * 1.0);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        state.noiseBuf = buf;
        return buf;
    }

    function demo() {
        const ctx = ensureContext();
        detachSource();
        if (state.mediaEl) state.mediaEl.pause();
        stopDemoSequencer();

        const bus = ctx.createGain();
        bus.gain.value = 0.9;
        bus.connect(state.analyser);
        state.masterGain.gain.value = 1.0;

        const BPM = 124;
        const sixteenth = 60 / BPM / 4;
        const SCALE = [0, 3, 5, 7, 10, 12, 15];        // minor pentatonic
        const ROOT = 55;                                // A1
        const noise = makeNoiseBuffer(ctx);

        const seq = { bus, timer: null, step: 0, nextTime: ctx.currentTime + 0.08, sixteenth };

        function kick(t) {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(140, t);
            o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(1.0, t + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
            o.connect(g); g.connect(bus);
            o.start(t); o.stop(t + 0.36);
        }

        function hat(t, open) {
            const s = ctx.createBufferSource();
            s.buffer = noise;
            const bp = ctx.createBiquadFilter();
            bp.type = 'highpass';
            bp.frequency.value = 7500;
            const g = ctx.createGain();
            const dur = open ? 0.13 : 0.045;
            g.gain.setValueAtTime(0.16, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            s.connect(bp); bp.connect(g); g.connect(bus);
            s.start(t); s.stop(t + dur + 0.02);
        }

        function bass(t, freq, dur) {
            const o = ctx.createOscillator();
            const lp = ctx.createBiquadFilter();
            const g = ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(freq, t);
            lp.type = 'lowpass';
            lp.frequency.setValueAtTime(180, t);
            lp.frequency.exponentialRampToValueAtTime(900, t + 0.04);
            lp.frequency.exponentialRampToValueAtTime(220, t + dur);
            lp.Q.value = 6;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.34, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(lp); lp.connect(g); g.connect(bus);
            o.start(t); o.stop(t + dur + 0.02);
        }

        function stab(t, freq) {
            [1, 1.5, 2.0].forEach((mult, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = i === 0 ? 'triangle' : 'sine';
                o.frequency.value = freq * mult * 4;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(0.075, t + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
                o.connect(g); g.connect(bus);
                o.start(t); o.stop(t + 0.95);
            });
        }

        function scheduleStep(step, t) {
            const bar = Math.floor(step / 16) % 4;
            const s = step % 16;

            if (s % 4 === 0) kick(t);                          // four on the floor
            if (s % 4 === 2) hat(t, true);                      // offbeat open hat
            if (s % 2 === 1) hat(t, false);                     // 8th closed hats
            if (s === 14 && bar % 2 === 1) kick(t + sixteenth * 0.5);

            // rolling bass: one note per 8th, walking the pentatonic
            if (s % 2 === 0) {
                const idx = (Math.floor(step / 2) + bar * 2) % SCALE.length;
                bass(t, ROOT * Math.pow(2, SCALE[idx] / 12), sixteenth * 1.9);
            }
            // pad stab on the bar turnaround
            if (s === 0 && bar === 3) stab(t, ROOT * 2);
        }

        seq.timer = setInterval(() => {
            const horizon = ctx.currentTime + 0.14;
            while (seq.nextTime < horizon) {
                scheduleStep(seq.step, seq.nextTime);
                seq.nextTime += sixteenth;
                seq.step = (seq.step + 1) % 64;
            }
        }, 25);

        state.demo = seq;
        state.mode = 'demo';
        state.name = 'demo beat · ' + BPM + ' BPM';
        hud.update();
    }

    /* ------------------------------------------------------------------ *
     *  spectrum analysis
     * ------------------------------------------------------------------ */
    function readBands(dt) {
        const a = state.analyser;
        if (!a) return false;
        a.getFloatFrequencyData(state.freqDb);

        const db = state.freqDb;
        const binHz = state.binHz;
        let lsum = 0, lw = 0, dsum = 0, dw = 0;

        // spectral flux on the analyser spectrum: dB -> linear, positive
        // frame-to-frame difference. Matches the offline path so live playback
        // flashes on the same transients the render does.
        if (!state.prevMag || state.prevMag.length !== db.length)
            state.prevMag = new Float32Array(db.length);
        const pm = state.prevMag;
        const ranges = { low: [20, 160], mid: [160, 2000], high: [2000, 16000] };
        const flux = { low: 0, mid: 0, high: 0 };
        for (const key in ranges) {
            const f0 = ranges[key][0], f1 = ranges[key][1];
            const k0 = Math.max(1, Math.floor(f0 / binHz));
            const k1 = Math.min(db.length - 1, Math.ceil(f1 / binHz));
            let sum = 0;
            for (let k = k0; k <= k1; k++) {
                const m = db[k] > -100 ? Math.pow(10, db[k] / 20) : 0;
                if (m > pm[k]) sum += m - pm[k];
                pm[k] = m;
            }
            flux[key] = sum;
        }

        for (const b of BANDS) {
            const i0 = Math.max(1, Math.floor(b.from / binHz));
            const i1 = Math.min(db.length - 1, Math.ceil(b.to / binHz));
            let peak = -140;
            for (let i = i0; i <= i1; i++) if (db[i] > peak) peak = db[i];

            // map dBFS -> 0..1 around the band's calibrated reference level
            let n = clamp((peak - (b.ref - b.span)) / b.span, 0, 1);

            // fast attack / slow release envelope
            const prev = state.env[b.key];
            const tau = n > prev ? b.attack : b.release;
            state.env[b.key] = lerp(prev, n, clamp(dt / tau, 0, 1));

            // novelty = how far above the ~1.6 s moving average we are
            state.slow[b.key] = lerp(state.slow[b.key], n, clamp(dt / 1.6, 0, 1));
            const nov = clamp((n - state.slow[b.key]) * 2.8, 0, 6);
            state.nov[b.key] = lerp(state.nov[b.key], nov, clamp(dt / 0.035, 0, 1));

            lsum += state.env[b.key] * b.weight; lw += b.weight;
            dsum += state.nov[b.key] * b.weight; dw += b.weight;
        }

        state.level = clamp(lsum / lw, 0, 1);
        state.dyn = clamp(dsum / dw, 0, 1);

        const tNow = now();
        state.fluxHist.push({ t: tNow, v: flux.low });
        while (state.fluxHist.length && tNow - state.fluxHist[0].t > 2.5) state.fluxHist.shift();
        const fv = state.fluxHist.map(h => h.v).sort((a, b) => a - b);
        const q95 = fv.length ? fv[Math.min(fv.length - 1, Math.floor(0.95 * fv.length))] : 0;
        state.transient = q95 > 1e-9 ? clamp(flux.low / q95, 0, 3) : 0;
        state.transientMid = q95 > 1e-9 ? clamp(flux.mid / q95, 0, 3) : 0;
        return true;
    }

    function detectBeat (dt) {
        // transient novelty on the low end is the kick detector
        // spectral flux transient is what we time the flash against
        const instant = state.transient != null
            ? state.transient
            : Math.max((state.novRaw.sub || 0) * 0.6 + (state.novRaw.bass || 0) * 0.4,
                       state.nov.sub * 0.6 + state.nov.bass * 0.4);

        const t = clock();

        // history in seconds of TRACK time so the threshold behaves the same
        // at any frame rate
        state.hist.push({ t, v: instant });
        while (state.hist.length && t - state.hist[0].t > 3.0) state.hist.shift();

        // threshold from a high percentile of the recent transients, not the
        // mean: during a dense drop the mean sits near the peak and everything
        // crosses it, which made the detector fire on the refractory grid
        const vals = state.hist.map(h => h.v).sort((a, b) => a - b);
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        state.fluxAvg = avg;

        const sens = (F() ? F().config.BEAT_SENSITIVITY : 1.35);
        const threshold = TUNE.thr * (sens / 1.35);
        const refractory = TUNE.refractory != null ? TUNE.refractory
                            : (F() ? (F().config.BEAT_REFRACTORY || 0.10) : 0.10);

        // hysteresis: one flash per transient. Without this the detector keeps
        // re-firing while the energy stays above the threshold.
        if (instant < threshold * TUNE.hysteresis) state.armed = true;

        const rising = instant >= state.prevInstant;
        state.prevInstant = instant;
        const isBeat = state.armed && rising && instant > threshold && (t - state.lastBeatAt) > refractory;

        if (OFFLINE.trace) OFFLINE.trace.push({ t: +t.toFixed(3), instant: +instant.toFixed(3),
            q: +(avg || 0).toFixed(3), threshold: +threshold.toFixed(3), armed: state.armed,
            rising, isBeat });

        if (isBeat) {
            const strength = clamp(instant, 0.2, 1);
            state.lastBeatAt = t;
            state.beat = Math.max(state.beat, strength);
            state.beatCount++;
            state.beatTimes.push(t);
            state.armed = false;

            if (state.beatTimes.length > 9) state.beatTimes.shift();
            if (state.beatTimes.length >= 4) {
                const iv = [];
                for (let i = 1; i < state.beatTimes.length; i++)
                    iv.push(state.beatTimes[i] - state.beatTimes[i - 1]);
                const med = iv.sort((x, y) => x - y)[Math.floor(iv.length / 2)];
                if (med > 0.2 && med < 2) state.bpm = 60 / med;
            }

            state.hueDrift += 0.05 + 0.09 * strength;
            if (!OFFLINE.analyzeOnly) onBeat(strength);
        }

        state.beat *= 1 - clamp(6.5 * (dt || 0.0167), 0, 1);
        return isBeat;
    }

    /* ------------------------------------------------------------------ *
     *  splat authoring
     * ------------------------------------------------------------------ */
    /** Dye governor.
     *
     *  A token bucket in dye units: it refills at DYE_RATE units per real
     *  second with a small burst reserve. When the bucket is empty the splat
     *  still pushes velocity (so the rhythm stays visible) but stops adding
     *  ink, which is what prevents the field from washing out to flat white
     *  on a loud, dense track. A plain rate cap, unlike a proportional
     *  limiter, cannot sit in a starved quasi-equilibrium and go black. */
    let dyeRate = 5.0;         // dye units per real second (servo-controlled)
    const DYE_BURST = 8.0;     // bucket capacity (allows a beat to punch)
    const VEL_RATE = 5200;     // velocity units per real second
    const VEL_BURST = 11000;   // momentum reserve for a kick

    function splatAt(x, y, dx, dy, color, radius) {
        const f = F();
        if (!f) return;

        const fc = state.fpsComp || 1;
        color = { r: color.r * fc, g: color.g * fc, b: color.b * fc };
        const dye = Math.abs(color.r) + Math.abs(color.g) + Math.abs(color.b);
        if (dye <= 1e-5) { f.splat(x, y, dx, dy, color, radius); return; }

        const take = Math.min(dye, state.dyeTok);
        if (take <= 1e-4) {
            f.splat(x, y, dx, dy, { r: 0, g: 0, b: 0 }, radius);  // push only
            return;
        }
        state.dyeTok -= take;

        // meter the momentum too: keep the beat but stop runaway push
        const vmag = Math.abs(dx) + Math.abs(dy);
        if (vmag > 1e-3) {
            const vscale = Math.min(1, state.velTok / vmag);
            state.velTok = Math.max(0, state.velTok - vmag * vscale);
            dx *= vscale;
            dy *= vscale;
        }

        const k = take / dye;
        f.splat(x, y, dx, dy, { r: color.r * k, g: color.g * k, b: color.b * k }, radius);
    }

    /** Beat = an expanding shock ring plus a soft centre flash.
     *  Forces are purely radial, so the dye blooms symmetrically instead of
     *  being swept into one corner by a net rotation. */
    function onBeat(strength) {
        const cfg = F().config;
        const gain = cfg.AUDIO_GAIN * cfg.BASS_GAIN;
        const f = F();
        const aspect = Math.min(f.canvas.width / Math.max(1, f.canvas.height), 2.2);
        const hue = state.hue + state.hueDrift;
        const n = 20;
        const ringR = 0.26;
        const force = (320 + 820 * strength) * gain;

        for (let i = 0; i < n; i++) {
            const ang = (i / n) * Math.PI * 2;           // fixed grid: symmetric
            const x = 0.5 + Math.cos(ang) * ringR * aspect * 0.62;
            const y = 0.5 + Math.sin(ang) * ringR;
            const c = audioColor(0.62 + 0.34 * strength + 0.02 * (i % 3), 1.0, 1.0,
                                 0.03 + 0.07 * strength * gain);
            splatAt(clamp(x, 0.015, 0.985), clamp(y, 0.015, 0.985),
                    Math.cos(ang) * force, Math.sin(ang) * force, c, 0.7);
        }

        // centre flash: wide + soft, deliberately low dye so it glows, not clips
        splatAt(0.5, 0.5, 0, 0,
                audioColor(0.97, 1.0, 1.0, 0.012 + 0.026 * strength),
                3.6 + 1.2 * strength);
    }

    /** Spectrum wheel, emitted in coherent waves (~12 Hz).
     *
     *  Every wave fires ALL bands above threshold at once, on a fixed
     *  angular grid with a full hue wheel, and with purely radial force.
     *  Trickling splats one at a time reads as random blobs; firing them as
     *  a synchronised wave reads as a pulsing radial EQ that the fluid then
     *  folds into filaments. */
    function spectrumWheel(dt) {
        const cfg = F().config;
        const f = F();
        if (!cfg.AUDIO_RING || !state.analyser) return;

        const WAVE_HZ = 6;
        state.waveT += dt;
        if (state.waveT < 1 / WAVE_HZ) return;
        const period = state.waveT;
        state.waveT = 0;

        const N = clamp(cfg.AUDIO_RING_POINTS | 0, 8, 128);
        const data = state.freqDb;
        const binHz = state.binHz;
        const aspect = Math.min(f.canvas.width / Math.max(1, f.canvas.height), 2.2);
        const mag = cfg.AUDIO_GAIN;
        const hueBase = state.hue + state.hueDrift;

        const fMin = 30, fMax = 14000;
        const ratio = Math.pow(fMax / fMin, 1 / (N - 1));
        let fired = 0;

        for (let i = 0; i < N; i++) {
            const hz = fMin * Math.pow(ratio, i);
            const bi = clamp(Math.floor(hz / binHz), 1, data.length - 1);
            const span = Math.max(1, Math.floor(bi * 0.12));
            let peak = -140;
            for (let k = -span; k <= span; k++) {
                const v = data[clamp(bi + k, 1, data.length - 1)];
                if (v > peak) peak = v;
            }
            const e = clamp((peak + 70) / 50, 0, 1);     // -70..-20 dBFS -> 0..1
            if (e < 0.12) continue;

            fired++;

            // golden-angle band mapping: neighbouring frequency bins land far
            // apart on the circle, so broadband energy stays balanced instead
            // of piling up in one sector
            const frac = (i * 0.6180339887498949) % 1;
            const ang = frac * Math.PI * 2;          // fixed: repeated waves build up
            const inner = 0.19 + 0.10 * (1 - e);
            const x = 0.5 + Math.cos(ang) * inner * aspect * 0.62;
            const y = 0.5 + Math.sin(ang) * inner;
            const out = (210 + 820 * e) * mag * (0.85 + 0.15 * Math.sin(state.t * 3 + i));

            // full 360 degree hue wheel + warm bias for loud bands
            // hue = the ray's own angular position: bass and treble neighbours
            // still land on opposite sides of the wheel, so the frame stays
            // polychromatic no matter which bands are loud
            const band = i / Math.max(1, N - 1);           // 0 = bass .. 1 = treble
            const accentRay = band > 0.80 && e > 0.50;      // sparse ice-cyan highs
            // crimson base, hot peaks climbing into tangerine/amber, and the
            // treble register biased upward so the ramp is fully used
            const t = clamp(0.18 + 0.26 * band + 0.32 * e * e, 0, 1);
            const col = audioColor(t, 1.0, 1.0,
                                   0.10 + 0.30 * e * mag, accentRay);
            splatAt(clamp(x, 0.012, 0.988), clamp(y, 0.012, 0.988),
                    Math.cos(ang) * out, Math.sin(ang) * out, col,
                    0.13 + 0.22 * e);
        }

        // keep the dye rate honest for very long bursts
        if (fired > 0) state.waves = (state.waves || 0) + 1;
        void period;
    }

    /** treble shimmer: sparse bright pin-pricks, probability-metered */
    function shimmer(dt) {
        const cfg = F().config;
        const f = F();
        const h = state.env.high * 0.6 + state.env.treble * 0.4;
        if (h < 0.25) return;

        const p = (1.0 + 7.0 * h) * cfg.TREBLE_GAIN * cfg.AUDIO_GAIN * dt;
        if (Math.random() > p) return;

        const aspect = f.canvas.width / Math.max(1, f.canvas.height);
        const x = Math.random();
        const y = Math.random();
        const ang = Math.random() * Math.PI * 2;
        const spd = (60 + 320 * h) * cfg.TREBLE_GAIN * cfg.AUDIO_GAIN;
        const col = audioColor(state.hue + state.hueDrift + 0.12 + Math.random() * 0.04,
                               0.85, 1.0, 0.02 + 0.05 * h);
        splatAt(x, y, Math.cos(ang) * spd * aspect * 0.25, Math.sin(ang) * spd, col,
                0.18 + 0.35 * h);
    }

    /* ------------------------------------------------------------------ *
     *  per-frame coupling of audio -> shader/UI parameters
     * ------------------------------------------------------------------ */
    function modulate(dt) {
        const cfg = F().config;

        if (cfg.AUDIO_BLOOM) {
            const target = clamp(0.50 + 0.60 * state.level + 0.35 * state.beat, 0.1, 1.35);
            cfg.BLOOM_INTENSITY = lerp(cfg.BLOOM_INTENSITY, target, clamp(6 * dt, 0, 1));
        }
        if (cfg.AUDIO_CURL) {
            const target = clamp(20 + 28 * (state.env.mid * 0.5 + state.env.lowMid * 0.5) + 16 * state.beat, 0, 50);
            cfg.CURL = lerp(cfg.CURL, target, clamp(4 * dt, 0, 1));
        }
        if (cfg.AUDIO_DISSIPATION) {
            // keep the dye buffer from stacking up during dense passages
            const target = clamp(0.78 + 0.10 * state.beat, 0.72, 0.95);
            cfg.DENSITY_DISSIPATION = lerp(cfg.DENSITY_DISSIPATION, target, clamp(1.5 * dt, 0, 1));
        }
        if (cfg.SUNRAYS) {
            cfg.SUNRAYS_WEIGHT = lerp(cfg.SUNRAYS_WEIGHT,
                clamp(0.55 + 0.45 * state.level, 0.3, 1.0), clamp(3 * dt, 0, 1));
        }
        // hue drifts continuously with high-frequency energy
        state.hueDrift += dt * (0.02 + 0.08 * state.dyn + 0.05 * state.env.treble);
    }

    /* ------------------------------------------------------------------ *
     *  Brightness servo
     *
     *  Rather than hand-tuning dye constants per track (loud masters, quiet
     *  masters, breakdowns all behave differently), sample the rendered frame
     *  once a second and steer the dye rate toward a target exposure. This is
     *  what keeps the piece from either fading to black or washing out.
     * ------------------------------------------------------------------ */
    const servoState = { mean: 0.3, clipped: 0, t: 0, ready: false };

    function servo(rdt) {
        servoState.t += rdt;
        if (servoState.t < 0.25) return;
        servoState.t = 0;

        const stats = window.__frameStats;
        if (!stats || state.mode === 'off' || !stats.samples) return;
        const s2 = { mean: stats.mean, clipped: stats.clipped };
        servoState.mean = s2.mean;
        servoState.clipped = s2.clipped;
        servoState.ready = true;

        const TARGET = 0.42;   // ~128/255 mean, measured as the sweet spot          // 0..1 mean luminance of the display pass
        const err = TARGET - s2.mean;

        // proportional + integral-ish correction, faster to cut than to add
        let k = err > 0 ? 0.55 : 0.35;
        if (s2.clipped > 0.02) k = 0.8;       // highlights blowing out: clamp hard

        dyeRate = clamp(dyeRate * (1 + err * k * 4.0), 0.05, 22.0);
        state.dyeRate = dyeRate;
    }

    /* ------------------------------------------------------------------ *
     *  HUD
     * ------------------------------------------------------------------ */
    const hud = (function () {
        let root, bars = {}, label, prog, timeEl;
        const keys = BANDS.map(b => b.key);

        function build() {
            if (root) return;
            root = document.createElement('div');
            root.id = 'fluid-hud';
            root.innerHTML = [
                '<div class="fh-top"><span class="fh-dot"></span><span class="fh-name">audio</span></div>',
                '<div class="fh-bars">' + keys.map(k =>
                    '<div class="fh-bar"><i data-k="' + k + '"></i></div>').join('') + '</div>',
                '<div class="fh-prog"><i></i></div>',
                '<div class="fh-row"><span class="fh-time">0:00</span>'
                + '<span class="fh-keys"><b>M</b> mic <b>F</b> file <b>D</b> demo <b>S</b> stop <b>H</b> hide <b>V</b> clean</span></div>'
            ].join('');
            const style = document.createElement('style');
            style.textContent = `
                #fluid-hud {
                    position: fixed; left: 14px; bottom: 14px; z-index: 20;
                    font: 500 12.5px/1.45 ui-monospace, "SF Mono", Menlo, monospace;
                    color: #eaf1ff; letter-spacing: .03em; text-transform: lowercase;
                    background: rgba(6,8,16,.72); border: 1px solid rgba(150,190,255,.28);
                    border-radius: 10px; padding: 8px 10px 7px; backdrop-filter: blur(9px);
                    pointer-events: none; user-select: none; min-width: 200px;
                    transition: opacity .2s ease;
                }
                #fluid-hud.hidden { opacity: 0; }
                #fluid-hud .fh-top { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
                #fluid-hud .fh-dot {
                    width: 6px; height: 6px; border-radius: 50%; background: #3d4a63;
                    box-shadow: 0 0 6px #000; transition: background .2s, box-shadow .2s;
                }
                #fluid-hud.live .fh-dot { background: #57f2a8; box-shadow: 0 0 10px #57f2a8cc; }
                #fluid-hud .fh-name { opacity: .95; max-width: 230px; overflow: hidden;
                    text-overflow: ellipsis; white-space: nowrap; }
                #fluid-hud .fh-bars { display: flex; align-items: flex-end; gap: 3px; height: 30px; }
                #fluid-hud .fh-bar {
                    width: 12px; height: 100%; border-radius: 2px;
                    background: rgba(255,255,255,.06); overflow: hidden;
                    display: flex; align-items: flex-end;
                }
                #fluid-hud .fh-bar i { display: block; width: 100%; height: 2%;
                    border-radius: 2px; transition: height .05s linear; }
                #fluid-hud .fh-bar:nth-child(1) i { background: linear-gradient(#ff5d7a,#7a1f3d); }
                #fluid-hud .fh-bar:nth-child(2) i { background: linear-gradient(#ff9d4d,#8a3d12); }
                #fluid-hud .fh-bar:nth-child(3) i { background: linear-gradient(#ffe066,#8a6a12); }
                #fluid-hud .fh-bar:nth-child(4) i { background: linear-gradient(#77f08b,#1a7a33); }
                #fluid-hud .fh-bar:nth-child(5) i { background: linear-gradient(#5ac8ff,#124a8a); }
                #fluid-hud .fh-bar:nth-child(6) i { background: linear-gradient(#c084ff,#4a1a8a); }
                #fluid-hud .fh-prog { margin-top: 6px; height: 2px; border-radius: 2px;
                    background: rgba(255,255,255,.10); overflow: hidden; }
                #fluid-hud .fh-prog i { display: block; height: 100%; width: 0%;
                    background: linear-gradient(90deg, #57f2a8, #7fb6ff); }
                #fluid-hud .fh-row { display: flex; align-items: baseline; justify-content: space-between;
                    gap: 8px; margin-top: 5px; }
                #fluid-hud .fh-time { opacity: .8; font-size: 11px; font-variant-numeric: tabular-nums; color: #b9d4ff; }
                #fluid-hud .fh-keys { opacity: .72; font-size: 10.5px; }
                #fluid-hud .fh-keys b { color: #9fc2ff; font-weight: 600; }
                #fluid-hud .fh-flash { color: #ffd166; }
            `;
            document.head.appendChild(style);
            document.body.appendChild(root);
            keys.forEach(k => { bars[k] = root.querySelector('i[data-k="' + k + '"]'); });
            prog = root.querySelector('.fh-prog i');
            timeEl = root.querySelector('.fh-time');
            label = root.querySelector('.fh-name');
        }

        let lastTxt = '';
        function update() {
            build();
            const txt = state.mode === 'off' ? 'no audio · press D'
                      : state.mode === 'mic' ? 'mic · live'
                      : state.name || state.mode;
            if (txt !== lastTxt) { label.textContent = txt; lastTxt = txt; }
            root.classList.toggle('live', state.mode === 'mic' || state.mode === 'file' || state.mode === 'demo');
        }

        function frame() {
            if (!root) return;
            for (const k of keys) {
                const v = clamp(state.env[k], 0, 1);
                bars[k].style.height = (2 + v * 98).toFixed(1) + '%';
            }
            const el = state.mediaEl;
            if (el && isFinite(el.duration) && el.duration > 0) {
                const f = clamp(el.currentTime / el.duration, 0, 1);
                prog.style.width = (f * 100).toFixed(1) + '%';
                const mm = Math.floor(el.currentTime / 60);
                const ss = Math.floor(el.currentTime % 60);
                timeEl.textContent = mm + ':' + String(ss).padStart(2, '0');
            } else if (prog) {
                prog.style.width = '0%';
                timeEl.textContent = state.mode === 'demo' ? 'live' : '--:--';
            }
        }

        function flash(msg) {
            build();
            label.innerHTML = '<span class="fh-flash">' + msg + '</span>';
            lastTxt = msg;
            setTimeout(() => { lastTxt = ''; update(); }, 2600);
        }

        function toggle() { build(); root.classList.toggle('hidden'); }

        return { build, update, frame, flash, toggle };
    })();

    /* Per-band reference/span for the offline FFT path. The AnalyserNode and a
     * raw radix-2 FFT don't share a dB scale, so these were measured from the
     * track itself (10 samples/second over the full 204.6 s): ref = 97th
     * percentile, span sized so the median lands at ~0.55 and quiet sections
     * fall to near zero. Keeps the dynamics honest without hand-tuned guesses. */
    const OFFLINE_CAL = {
        sub:    { ref:  -5.6, span: 61.0 },
        bass:   { ref:  -5.5, span: 28.7 },
        lowMid: { ref: -13.6, span: 18.0 },
        mid:    { ref: -14.0, span: 24.9 },
        high:   { ref: -23.8, span: 25.6 },
        treble: { ref: -35.5, span: 25.8 },
    };

    /* ==================================================================== *
     *  OFFLINE RENDERER (used for full-length renders)
     *
     *  Realtime playback can't be trusted for a 3.5-minute render, so in
     *  ?render mode the audio is decoded up front and analysed with our own
     *  FFT at exact, fixed timestamps. Every frame is then stepped with a
     *  fixed dt, which makes the output deterministic and synced to the
     *  sample, whatever speed the GPU renders at.
     * ==================================================================== */
    /* detector tuning (overridable for sweeps via setDetector) */
    // measured against ground-truth low-end onsets on this track:
    // 52% of kicks caught, 11% false positives, mean |error| ~16 ms at 30 fps
    const TUNE = { thr: 0.34, hysteresis: 0.50 };

    const OFFLINE = { ready: false, buffer: null, sampleRate: 0, fps: 30, fft: null, win: null,
                      startFrame: 0, time: 0, rendering: false, analyzeOnly: false };
    let captureCanvas = null, captureCtx = null, lastFrameStats = null;

    function makeFFT (n) {
        const levels = Math.log2(n) | 0;
        const cos = new Float32Array(n / 2), sin = new Float32Array(n / 2);
        for (let i = 0; i < n / 2; i++) {
            cos[i] = Math.cos(2 * Math.PI * i / n);
            sin[i] = Math.sin(2 * Math.PI * i / n);
        }
        return { n, levels, cos, sin, rev: new Uint32Array(n) };
    }

    // iterative radix-2 in-place FFT (real input in re[], imag zeroed)
    function fft (t, re, im) {
        const n = t.n;
        for (let i = 0; i < n; i++) {
            let j = 0, x = i;
            for (let k = 0; k < t.levels; k++) { j = (j << 1) | (x & 1); x >>= 1; }
            if (j > i) {
                let tr = re[i]; re[i] = re[j]; re[j] = tr;
                let ti = im[i]; im[i] = im[j]; im[j] = ti;
            }
        }
        for (let size = 2; size <= n; size <<= 1) {
            const half = size >> 1, step = n / size;
            for (let i = 0; i < n; i += size) {
                for (let j = i, k = 0; j < i + half; j++, k += step) {
                    const l = j + half;
                    const cos = t.cos[k], sin = t.sin[k];
                    const tre = re[l] * cos + im[l] * sin;
                    const tim = -re[l] * sin + im[l] * cos;
                    re[l] = re[j] - tre; im[l] = im[j] - tim;
                    re[j] += tre; im[j] += tim;
                }
            }
        }
    }

    /** per-band peak dBFS at `time` seconds, mirroring the AnalyserNode path */
    function bandsAt (time) {
        const n = 4096;
        const buf = OFFLINE.buffer;
        const sr = OFFLINE.sampleRate;
        const centre = Math.floor(time * sr);
        const start = Math.max(0, Math.min(buf.length - n, centre - (n >> 1)));

        const re = new Float32Array(n), im = new Float32Array(n), win = OFFLINE.win;
        const chans = buf.numberOfChannels;
        for (let i = 0; i < n; i++) {
            let v = 0;
            for (let c = 0; c < chans; c++) v += buf.getChannelData(c)[start + i] || 0;
            re[i] = (v / chans) * win[i];
        }
        fft(OFFLINE.fft, re, im);

        const binHz = sr / n;
        const out = {};

        // ---- spectral flux: the thing that actually marks a hit ----------
        // peak-hold band levels barely move during a dense kick pattern, so
        // novelty from them is flat; positive frame-to-frame change in the
        // magnitude spectrum is what distinguishes one hit from the next.
        const half = n / 2;
        if (!OFFLINE.prevMag || OFFLINE.prevMag.length !== half)
            OFFLINE.prevMag = new Float32Array(half);
        const prevMag = OFFLINE.prevMag;
        const ranges = { low: [20, 160], mid: [160, 2000], high: [2000, 16000] };
        const flux = { low: 0, mid: 0, high: 0 };
        for (const key in ranges) {
            const [f0, f1] = ranges[key];
            const k0 = Math.max(1, Math.floor(f0 / binHz));
            const k1 = Math.min(half - 1, Math.ceil(f1 / binHz));
            let sum = 0;
            for (let k = k0; k <= k1; k++) {
                const m = Math.hypot(re[k], im[k]);
                if (m > prevMag[k]) sum += m - prevMag[k];
                prevMag[k] = m;
            }
            flux[key] = sum;
        }
        OFFLINE.lastFlux = flux;

        for (const b of BANDS) {
            const i0 = Math.max(1, Math.floor(b.from / binHz));
            const i1 = Math.min(n / 2 - 1, Math.ceil(b.to / binHz));
            let peak = 0;
            for (let i = i0; i <= i1; i++) {
                const p = re[i] * re[i] + im[i] * im[i];
                if (p > peak) peak = p;
            }
            // magnitude -> dBFS (Hann window normalised by its coherent gain)
            const mag = Math.sqrt(peak) * 2 / (n * 0.5);
            out[b.key] = mag > 1e-9 ? 20 * Math.log10(mag) : -120;
        }
        return out;
    }

    /** feed the offline spectrum through the same envelope/novelty stage */
    function readBandsOffline (time, dt) {
        const db = bandsAt(time);
        let lsum = 0, lw = 0, dsum = 0, dw = 0;
        for (const b of BANDS) {
            const cal = OFFLINE_CAL[b.key] || b;
            const peak = db[b.key];
            let n = clamp((peak - (cal.ref - cal.span)) / cal.span, 0, 1);
            const prev = state.env[b.key];
            const tau = n > prev ? b.attack : b.release;
            state.env[b.key] = lerp(prev, n, clamp(dt / tau, 0, 1));
            state.slow[b.key] = lerp(state.slow[b.key], n, clamp(dt / 1.6, 0, 1));
            const nov = clamp((n - state.slow[b.key]) * 2.8, 0, 6);
            state.novRaw[b.key] = nov;
            state.nov[b.key] = lerp(state.nov[b.key], nov, clamp(dt / 0.035, 0, 1));
            lsum += state.env[b.key] * b.weight; lw += b.weight;
            dsum += state.nov[b.key] * b.weight; dw += b.weight;
        }
        state.level = clamp(lsum / lw, 0, 1);
        state.dyn = clamp(dsum / dw, 0, 1);

        // transient strength: low-band flux normalised against its own recent
        // 95th percentile, so ~1.0 means "as hard as the loudest recent hit"
        const flux = OFFLINE.lastFlux || { low: 0, mid: 0, high: 0 };
        state.fluxHist.push({ t: time, v: flux.low });
        while (state.fluxHist.length && time - state.fluxHist[0].t > 2.5) state.fluxHist.shift();
        const fv = state.fluxHist.map(h => h.v).sort((a, b) => a - b);
        const q95 = fv.length ? fv[Math.min(fv.length - 1, Math.floor(0.95 * fv.length))] : 0;
        state.transient = q95 > 1e-9 ? clamp(flux.low / q95, 0, 3) : 0;
        state.transientMid = q95 > 1e-9 ? clamp(flux.mid / q95, 0, 3) : 0;
        return true;
    }

    async function initOffline (url, fps) {
        const ctx = ensureContext();
        const res = await fetch(url);
        const arr = await res.arrayBuffer();
        OFFLINE.buffer = await ctx.decodeAudioData(arr);
        OFFLINE.sampleRate = OFFLINE.buffer.sampleRate;
        OFFLINE.fps = fps || 30;
        OFFLINE.fft = makeFFT(4096);
        OFFLINE.win = new Float32Array(4096);
        for (let i = 0; i < 4096; i++) OFFLINE.win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / 4096);
        OFFLINE.ready = true;

        state.mode = 'file';
        state.name = 'Aftershock';
        state.mediaEl = { currentTime: 0, duration: OFFLINE.buffer.duration, paused: false };
        hud.update();
        return { duration: OFFLINE.buffer.duration, sampleRate: OFFLINE.sampleRate, fps: OFFLINE.fps };
    }

    /** step exactly one output frame and return the canvas as a PNG data URL */
    function renderFrame (index, opts) {
        if (!OFFLINE.started) { OFFLINE.started = true; OFFLINE.startFrame = index; }
        if (!OFFLINE.ready) throw new Error('initOffline() first');
        const fps = OFFLINE.fps;
        const dt = 1 / fps;
        const t = index / fps;

        OFFLINE.rendering = true;
        OFFLINE.time = t;
        state.mediaEl.currentTime = t;
        state.t += dt;

        // analyse slightly ahead: the frame we emit should carry the transient,
        // not the frame before it
        readBandsOffline(t + (0.5 / fps) * (OFFLINE.lookahead ?? 0), dt);

        const nowReal = now();
        const rdt = dt;                     // clock is the frame counter in offline mode
        state.lastReal = nowReal;
        state.fpsComp = clamp(60 * dt, 1, 5);   // 2.0 at 30 fps
        state.dyeTok = Math.min(DYE_BURST, state.dyeTok + dyeRate * rdt);
        state.velTok = Math.min(VEL_BURST, state.velTok + VEL_RATE * rdt);

        // exposure servo, driven by the actual frame it just produced
        if (index % Math.round(fps * 0.25) === 0 && index > 0) {
            const stats = window.__frameStats;
            if (stats && stats.mean) {
                const err = 0.40 - stats.mean;
                let k = err > 0 ? 0.55 : 0.35;
                if (stats.clipped > 0.02) k = 0.8;
                // first sample: jump straight to the right order of magnitude
                if (!OFFLINE.servoLocked && stats.mean > 0.01) {
                    dyeRate = clamp(dyeRate * (0.40 / stats.mean), 0.05, 70.0);
                    OFFLINE.servoLocked = true;
                }
                dyeRate = clamp(dyeRate * (1 + err * k * 8.0), 0.05, 70.0);
                state.dyeRate = dyeRate;
            }
        }

        if (index === OFFLINE.startFrame) dyeRate = 6.0;

        detectBeat(dt);
        spectrumWheel(dt);
        shimmer(dt);
        modulate(dt);
        hud.frame();
        state.hue += dt * 0.012;

        F().tickFrame(dt);

        // A WebGL canvas without preserveDrawingBuffer hands back an empty
        // image to toDataURL(); copy it into a 2D canvas first (the same trick
        // the exposure probe uses) and encode from there.
        const src = F().canvas;
        if (!captureCanvas || captureCanvas.width !== src.width || captureCanvas.height !== src.height) {
            captureCanvas = document.createElement('canvas');
            captureCanvas.width = src.width;
            captureCanvas.height = src.height;
            captureCtx = captureCanvas.getContext('2d');
        }
        captureCtx.drawImage(src, 0, 0);
        lastFrameStats = { ...window.__frameStats };
        return captureCanvas.toDataURL('image/png');
    }


    /* ------------------------------------------------------------------ *
     *  ANALYSIS HELPERS (used to measure beat accuracy, not for playback)
     * ------------------------------------------------------------------ */

    /** run the beat detector across the whole track without rendering */
    function analyzeTrack (fps) {
        if (!OFFLINE.ready) throw new Error('initOffline() first');
        const oldFps = OFFLINE.fps;
        OFFLINE.fps = fps || 30;
        OFFLINE.analyzeOnly = true;
        OFFLINE.rendering = true;
        state.beatCount = 0;
        state.beatTimes = [];
        state.lastBeatAt = -10;
        state.hist = [];
        state.env = Object.fromEntries(BANDS.map(b => [b.key, 0]));
        state.nov = Object.fromEntries(BANDS.map(b => [b.key, 0]));
        state.fluxHist = [];
        state.prevMag = null;
        state.transient = null;
        state.armed = true;
        state.prevInstant = 0;
        OFFLINE.prevMag = null;
        state.slow = Object.fromEntries(BANDS.map(b => [b.key, 0]));

        const dt = 1 / OFFLINE.fps;
        const total = Math.floor(OFFLINE.buffer.duration * OFFLINE.fps);
        const beats = [];
        for (let i = 0; i < total; i++) {
            const t = i / OFFLINE.fps;
            OFFLINE.time = t;
            readBandsOffline(t + (0.5 / OFFLINE.fps) * (OFFLINE.lookahead ?? 0), dt);
            const before = state.beatCount;
            detectBeat(dt);
            if (state.beatCount > before) beats.push(+t.toFixed(3));
        }
        OFFLINE.analyzeOnly = false;
        OFFLINE.rendering = false;
        OFFLINE.fps = oldFps;
        return beats;
    }

    /** spectral-flux onsets — independent ground truth for "did it land on the hit" */
    function fluxOnsets (hopSec, fmin, fmax) {
        if (!OFFLINE.ready) throw new Error('initOffline() first');
        const hopSecs = hopSec || 0.005;
        const n = OFFLINE.fft.n;   // must match the FFT table
        const buf = OFFLINE.buffer, sr = OFFLINE.sampleRate;
        const hop = Math.max(1, Math.round(hopSecs * sr));
        const frames = Math.floor((buf.length - n) / hop);
        const ch = buf.numberOfChannels;
        const data = [];
        for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));

        const re = new Float32Array(n), im = new Float32Array(n);
        const prev = new Float32Array(n / 2), cur = new Float32Array(n / 2);
        const flux = new Float32Array(frames);
        for (let f = 0; f < frames; f++) {
            const start = f * hop;
            for (let i = 0; i < n; i++) {
                let v = 0;
                for (let c = 0; c < ch; c++) v += data[c][start + i] || 0;
                re[i] = (v / ch) * OFFLINE.win[i];
                im[i] = 0;
            }
            fft(OFFLINE.fft, re, im);
            let sum = 0;
            const binHz = sr / n;
            const k0 = Math.max(1, Math.floor((fmin || 0) / binHz));
            const k1 = Math.min(n / 2 - 1, Math.ceil((fmax || sr / 2) / binHz));
            for (let k = 1; k < n / 2; k++) {
                const m = Math.hypot(re[k], im[k]);
                if (f > 0 && m > prev[k] && k >= k0 && k <= k1) sum += m - prev[k];
                cur[k] = m;
            }
            flux[f] = sum;
            prev.set(cur);
        }

        // peak picking with a local mean threshold, then NMS so one hit
        // produces exactly one onset
        const W = Math.round(0.35 / hopSecs);
        const cand = [];
        for (let f = 1; f < frames - 1; f++) {
            let mean = 0, cnt = 0;
            for (let j = Math.max(0, f - W); j < Math.min(frames, f + W + 1); j++) { mean += flux[j]; cnt++; }
            mean /= Math.max(1, cnt);
            const v = flux[f];
            if (v > flux[f - 1] && v >= flux[f + 1] && v > mean * 1.9 && v > 0)
                cand.push({ t: ((f * hop) + n / 2) / sr, v });
        }
        const onsets = [];
        const minGap = 0.085;
        for (const c of cand) {
            const last = onsets[onsets.length - 1];
            if (!last || c.t - last.t >= minGap) onsets.push(c);
            else if (c.v > last.v) onsets[onsets.length - 1] = c;   // keep the strongest
        }
        return onsets.map(o => +o.t.toFixed(3));
    }

    /* ------------------------------------------------------------------ *
     *  main tick — called from update() in script.js
     * ------------------------------------------------------------------ */
    let lastFrame = now();

    function tick(dt) {
        state.t += dt;

        if (state.mode !== 'off' && !state.analyser) return;
        if (state.mode === 'off') {
            // idle: gentle ambient drift so the backup sim still breathes
            return;
        }

        if (OFFLINE.ready) return;                 // driver calls renderFrame()
        if (!readBands(dt)) { hud.frame(); return; }

        // real elapsed time (sim dt is capped, so the budgets need this)
        const nowReal = now();
        if (!state.lastReal) state.lastReal = nowReal;
        const rdt = clamp(nowReal - state.lastReal, 0, 0.25);
        state.lastReal = nowReal;

        state.fpsComp = clamp(rdt / 0.0167, 1, 5);   // slower frames carry more ink per splat

        servo(rdt);
        state.dyeTok = Math.min(DYE_BURST, state.dyeTok + dyeRate * rdt);
        state.velTok = Math.min(VEL_BURST, state.velTok + VEL_RATE * rdt);

        detectBeat(dt);
        spectrumWheel(dt);
        shimmer(dt);
        modulate(dt);
        hud.frame();

        state.hue += dt * 0.012;
    }

    /* ------------------------------------------------------------------ *
     *  input wiring
     * ------------------------------------------------------------------ */
    function boot() {
        hud.build();
        hud.update();

        // keyboard
        window.addEventListener('keydown', e => {
            if (e.target && /input|textarea/i.test(e.target.tagName)) return;
            const k = e.key.toLowerCase();
            if (k === 'm') enableMic();
            else if (k === 'f') openFilePicker();
            else if (k === 'd') demo();
            else if (k === 's') stop();
            else if (k === 'h') hud.toggle();
        });

        // presentation mode: panel + brand fade away while nothing is touched
        let idleAt = now(), cleanForced = false;
        const cleanCss = document.createElement('style');
        cleanCss.textContent = `
            body.fluid-clean .dg, body.fluid-clean #brand { opacity: 0 !important; pointer-events: none !important; }
            .dg, #brand { transition: opacity .45s ease; }
        `;
        document.head.appendChild(cleanCss);
        const setClean = on => document.body.classList.toggle('fluid-clean', on);
        const bump = () => { idleAt = now(); if (!cleanForced) setClean(false); };
        ['pointermove', 'pointerdown', 'keydown', 'wheel'].forEach(ev =>
            window.addEventListener(ev, bump, { passive: true }));
        setInterval(() => {
            if (cleanForced) return;
            if (state.mode !== 'off' && now() - idleAt > 3.5) setClean(true);
        }, 500);
        window.addEventListener('keydown', e => {
            if (e.key.toLowerCase() === 'v') {
                cleanForced = !cleanForced;
                setClean(cleanForced || now() - idleAt > 3.5);
                hud.flash(cleanForced ? 'clean mode' : 'controls visible');
            }
        });

        // drag & drop anywhere
        const dz = document.getElementById('dropzone');
        let dragDepth = 0;
        window.addEventListener('dragenter', e => {
            e.preventDefault(); dragDepth++;
            if (dz) dz.classList.add('on');
        });
        window.addEventListener('dragover', e => { e.preventDefault(); });
        window.addEventListener('dragleave', e => {
            e.preventDefault();
            if (--dragDepth <= 0 && dz) dz.classList.remove('on');
        });
        window.addEventListener('drop', e => {
            e.preventDefault();
            dragDepth = 0;
            if (dz) dz.classList.remove('on');
            const f = e.dataTransfer.files && e.dataTransfer.files[0];
            if (f) loadFile(f);
        });

        // first gesture unlocks the AudioContext -> start the demo beat
        const kickstart = () => {
            if (state.autoStarted || state.mode !== 'off') return;
            state.autoStarted = true;
            const params = new URLSearchParams(location.search);
            if (params.has('mic')) { enableMic(); return; }
            if (params.get('demo') === '0') return;
            if (params.has('audio')) { loadURL(params.get('audio')); return; }
            demo();
        };
        window.addEventListener('pointerdown', kickstart, { once: true });
        window.addEventListener('keydown', kickstart, { once: true });

        // ?audio=... starts immediately (user gesture still recommended)
        const params = new URLSearchParams(location.search);
        if (params.get('demo') === '0') {
            hud.flash('autoplay off · press D for demo');
        }
    }

    window.FluidAudio = {
        tick, demo, enableMic, openFilePicker, loadFile, loadURL,
        stop, suspend, resume, state, hud, servoState,
        initOffline, renderFrame, OFFLINE, bandsAt, analyzeTrack, fluxOnsets,
        debugDetect: (from, to, fps) => {
            OFFLINE.trace = [];
            const a = Math.max(0, Math.floor(from * fps)), b2 = Math.floor(to * fps);
            for (let i = a; i < b2; i++) {
                OFFLINE.time = i / fps;
                OFFLINE.rendering = true;
                readBandsOffline(i / fps + (0.5 / fps) * (OFFLINE.lookahead ?? 0), 1 / fps);
                detectBeat(1 / fps);
            }
            OFFLINE.rendering = false;
            const out = OFFLINE.trace; OFFLINE.trace = null;
            return out;
        },
        setDetector: p => Object.assign(TUNE, p),
        get detector () { return { ...TUNE }; },
        paletteColor: t => rampColor(t),
        get frameStats () { return lastFrameStats; },
        get dyeRate () { return dyeRate; },
        get bands () { return Object.assign({}, state.env); },
    };

    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
