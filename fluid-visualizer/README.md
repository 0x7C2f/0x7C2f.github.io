# Fluid Music Visualizer — AFTERSHOCK

An audio-reactive music visualizer built on Pavel Dobryakov's
[WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)
(MIT). The original simulation is untouched in spirit — a GPU Stable-Fluids solver
with vorticity confinement, bloom and sunrays — plus a new audio layer that turns a
live FFT into dye, velocity, colour and exposure.

```
open index.html through a local server (not file://)
```

## Run it

```bash
./run.sh                      # serves this folder and opens the browser
./run.sh 8080                 # custom port
```

Then, in the page:

| key | action |
|-----|--------|
| `M` | use the microphone |
| `F` | pick an audio file (or just drag one anywhere onto the window) |
| `D` | built-in generative demo beat (no file, no permission needed) |
| `S` | stop audio |
| `H` | hide the HUD |
| `V` | clean presentation mode (hides the control panel) |
| `Space` | pause the simulation |

URL shortcuts: `?audio=/AFTERSHOCK.mp3`, `?mic`, `?demo=0` (no autoplay).

The control panel gets a **🎵 Audio Reactive** folder with reactivity, bass/treble
force, beat sensitivity, spectrum-ring, bloom/vorticity coupling, auto-dissipation,
plus file / mic / demo buttons. It also auto-hides after ~3.5 s without input while
audio is playing, so the piece can be left running as a full-screen visual.

## How the audio drives the fluid

Everything lives in `audio-reactor.js`; the only hooks into `script.js` are a
`FluidAudio.tick(dt)` call in the render loop, a `window.__FLUID__` bridge exposing
`splat()` / `sampleLuminance()`, and two shader lines for tonemapping and
dithering.

1. **Analysis** — one `AnalyserNode` (fftSize 4096) feeding six calibrated bands
   (sub, bass, lowMid, mid, high, treble). Each band is mapped from dBFS to 0..1
   around a reference level, with fast-attack / slow-release envelopes, plus a
   per-band *novelty* signal (energy vs a ~1.6 s moving average).
2. **Beat detection** — low-band novelty crossing an adaptive threshold, with a
   210 ms refractory window. A beat fires a 20-point **shock ring** with purely
   radial force plus a soft centre flash, so the frame blooms symmetrically
   instead of being swept into one corner by net rotation.
3. **Spectrum wheel** — 24 log-spaced bands fire as *coherent waves* (~6 Hz) on a
   fixed, golden-angle angular grid. Each ray pushes outward with force and dye
   proportional to its band energy, and **hue is sampled from the ray's own
   angular position**, so the frame stays polychromatic even when only a few
   neighbouring bands are loud.
4. **Exposure servo** — a 64×36 readback of the display pass steers the total dye
   rate (dye token bucket) toward a target mean luminance, with a hard clamp when
   more than 2 % of pixels clip. No per-track hand tuning, and it can't wash out
   to white or fade to black.
5. **Shader polish** — an ACES-style filmic rolloff keeps hue in hot cores instead
   of clipping to flat white, and a 1-LSB post-gamma dither removes 8-bit banding
   without painting a dot screen.

## Files

| file | role |
|------|------|
| `index.html` | page shell, brand overlay, drag-and-drop target |
| `script.js` | original simulation + audio hooks (`FluidAudio.tick`, `__FLUID__`, tonemap, `sampleLuminance`) |
| `audio-reactor.js` | FFT analysis, beat detection, splat authoring, HUD, sources, servo |
| `dat.gui.min.js`, `iconfont.ttf`, `LDR_LLL1_0.png`, `logo.png` | upstream assets |
| `AFTERSHOCK.mp3` | symlink to the track used for testing |
| `AFTERSHOCK-visualizer.ipynb` | notebook: serves the app, previews frames |

## Tuning notes

* Too dim → raise `TARGET` in `servo()` (default `0.28` of display luminance).
* Too soft / foggy → lower `config.DENSITY_DISSIPATION` (default `0.45`) and raise
  `vorticity`; crisper filaments come from tighter splat radii, not from more dye.
* Colour too mixed → the hue is `hueBase + angular position`; reduce the
  `0.05 * e` term in `spectrumWheel()` or slow `state.hueDrift`.

## Full-length GPU render

`render.js` renders the whole track offline instead of recording the screen:
the audio is decoded up front, analysed with an in-page FFT at exact
timestamps, and the simulation is stepped with a fixed `dt`, so the video is
frame-exact against the audio no matter how fast the GPU is.

```bash
# needs Xvfb: headless Chromium loses the WebGL context on some drivers,
# a headful browser under a virtual display keeps the real GPU
xvfb-run -a -s "-screen 0 1920x1080x24" \
  RENDER_HEADFUL=1 node render.js --out aftershock.mp4 --w 1920 --h 1080 --fps 30
```

Useful flags: `--from 100 --to 120` (a section), `--w/--h` (resolution),
`--fps` (24/30/60), `--audio` (source file), `--port`.

The renderer prints the live GPU string, per-frame speed and the exposure
servo's luminance so a black or blown-out render is obvious immediately.

## Cover palette

The colours come from the Aftershock artwork
(`03 Releases/Aftershock/Cover/Original`), sampled with k-means and turned into
an 8-stop ramp:

`#05070E` midnight → `#3A0A12` → `#7A0B16` deep crimson → `#992224` scarlet →
`#E11D2E` neon red → `#FF6A1A` tangerine → `#FFB23E` amber → `#F4E8D2` ivory

It's used two ways: splat colours are drawn along the ramp (hot rays climb into
amber), and the final image is graded through a 256px LUT of the same ramp
(`PALETTE_MIX`, `PALETTE_GAIN` in the config) so the frame keeps the cover's
identity even where additive blending would otherwise drift to pink. An ice-cyan
accent (`#65D8E8`) is mixed into the treble shimmer for contrast. Toggle the
whole thing with `config.PALETTE_COVER` or the *cover palette* checkbox.

## Beat accuracy

The flash is timed by **spectral flux** over 20–160 Hz (positive frame-to-frame
change in the magnitude spectrum), normalised against its own recent 95th
percentile, with hysteresis and a 100 ms refractory. Band *levels* are not used
for timing: during a dense kick pattern they sit at a near-constant value, so a
level-based novelty fires on its own refractory grid rather than on the music.

All beat timing runs on a **track clock** — `performance.now()` in offline mode
runs at render speed and silently throttled the flash to ~2.5 Hz.

Measured against ground truth on the Aftershock master (679 low-end onsets at a
5 ms hop): 87 % of beats land within ±90 ms of a real hit, median signed offset
−5 ms, 92 % within one frame at 30 fps. In the finished video the brightness
jump sits on the beat frame (median +0 frames).

Tuning: `TUNE.thr` (default `0.34`), `TUNE.hysteresis` (`0.50`),
`config.BEAT_REFRACTORY` (`0.10` s), `config.BEAT_SENSITIVITY` (panel slider).
`FluidAudio.analyzeTrack(fps)` returns the beat times for the whole track and
`FluidAudio.fluxOnsets(hop, fmin, fmax)` gives an independent onset ground truth.


## Attribution

Fluid solver, bloom, sunrays, dat.GUI wiring: **Pavel Dobryakov**,
WebGL-Fluid-Simulation, MIT (see `LICENSE`). Audio layer and shader tweaks:
added on top of that MIT grant; the same licence applies.
