#!/usr/bin/env node
/**
 * Full-length offline renderer.
 *
 *   node render.js --out out.mp4 [--fps 30] [--w 1920 --h 1080]
 *                  [--from 0 --to 204.6] [--audio AFTERSHOCK.mp3]
 *
 * Runs the visualizer in headless Chromium on the GPU (?render mode), steps
 * the simulation with a fixed dt against the decoded track, and pipes PNG
 * frames straight into ffmpeg. Deterministic and frame-exact against audio.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  if (!process.argv[i].startsWith('--')) continue;
  args[process.argv[i].slice(2)] = process.argv[i + 1];
}
const OUT = args.out || 'aftershock-visualizer.mp4';
const FPS = +(args.fps || 30);
const W = +(args.w || 1920);
const H = +(args.h || 1080);
const FROM = +(args.from || 0);
const TO = args.to != null ? +args.to : null;
const AUDIO = args.audio || 'AFTERSHOCK.mp3';
const ROOT = __dirname;
const PORT = +(args.port || 8811);

function loadPlaywright() {
  const cands = ['playwright', 'playwright-core',
    path.join(process.env.HOME || '', 'node_modules', 'playwright-core'),
    path.join(process.env.HOME || '', 'node_modules', 'playwright'),
    '/home/mrgrim/Development/penguinjuice/node_modules/playwright'];
  for (const c of cands) { try { return require(c); } catch (e) {} }
  return null;
}
function findChromium() {
  const local = path.join(process.env.HOME || '', '.cache', 'ms-playwright');
  try {
    for (const d of fs.readdirSync(local).sort().reverse()) {
      if (!d.startsWith('chromium-')) continue;
      for (const rel of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
        const exe = path.join(local, d, rel);
        if (fs.existsSync(exe)) return exe;
      }
    }
  } catch (e) {}
  for (const exe of ['/usr/bin/chromium', '/usr/bin/google-chrome']) if (fs.existsSync(exe)) return exe;
  return null;
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png',
  '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, url === '/' ? 'index.html' : url);
  fs.stat(file, (err, st) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    const type = MIME[path.extname(file)] || 'application/octet-stream';
    const range = req.headers.range;
    if (range && st.size) {
      const m = /bytes=(\d+)-(\d*)/.exec(range);
      const s = +m[1], e = m[2] ? +m[2] : st.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${s}-${e}/${st.size}`,
        'Accept-Ranges': 'bytes', 'Content-Length': e - s + 1 });
      fs.createReadStream(file, { start: s, end: e }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': st.size });
      fs.createReadStream(file).pipe(res);
    }
  });
});

(async () => {
  const pw = loadPlaywright();
  if (!pw) { console.error('playwright not found'); process.exit(1); }
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));

  // Headless Chromium loses the WebGL context on this box; a headful browser
  // under Xvfb keeps the real GPU (ANGLE/Vulkan). Run with:
  //   xvfb-run -a -s "-screen 0 1920x1080x24" node render.js ...
  const browser = await pw.chromium.launch({
    headless: process.env.RENDER_HEADFUL !== '1',
    executablePath: findChromium() || undefined,
    args: [
      '--no-sandbox',
      '--ignore-gpu-blocklist',
      '--use-angle=vulkan',
      '--enable-features=Vulkan',
      '--enable-gpu-rasterization',
      '--disable-frame-rate-limit',
      '--disable-gpu-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--mute-audio',
    ],
  });

  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  await page.goto(`http://127.0.0.1:${PORT}/index.html?render=1&demo=0`, { waitUntil: 'load' });
  await page.waitForTimeout(700);

  const renderer = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info');
    return dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
  process.stdout.write(`gpu: ${renderer}\n`);

  const info = await page.evaluate(async ({ url, fps }) => window.FluidAudio.initOffline(url, fps),
    { url: '/' + AUDIO, fps: FPS });
  process.stdout.write(`track: ${info.duration.toFixed(2)}s @ ${info.sampleRate} Hz · ${FPS} fps · ${W}x${H}\n`);

  const startT = FROM;
  const endT = TO != null ? Math.min(TO, info.duration) : info.duration;
  const total = Math.max(1, Math.round((endT - startT) * FPS));
  process.stdout.write(`frames: ${total} (${startT}s → ${endT.toFixed(2)}s)\n`);

  const ff = spawn('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-ss', String(startT), '-t', String(endT - startT), '-i', path.join(ROOT, AUDIO),
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', OUT,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const ffDone = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));

  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const idx = Math.round(startT * FPS) + i;
    const dataUrl = await page.evaluate(n => window.FluidAudio.renderFrame(n), idx);
    const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const buf = Buffer.from(b64, 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));

    if (i % 30 === 0 || i === total - 1) {
      const st = await page.evaluate(() => ({ ...(window.FluidAudio.frameStats || { mean: -1 }), rate: window.FluidAudio.dyeRate }));
      const el = (Date.now() - t0) / 1000;
      const fpsReal = (i + 1) / el;
      const eta = (total - i - 1) / Math.max(fpsReal, 0.1);
      process.stdout.write(`\rframe ${i + 1}/${total} · ${fpsReal.toFixed(1)} fps · eta ${(eta / 60).toFixed(1)} min · lum ${(st.mean ?? 0).toFixed(2)} · ink ${(st.rate ?? 0).toFixed(1)}  `);
    }
  }
  process.stdout.write('\n');
  ff.stdin.end();
  await ffDone;

  const stat = fs.statSync(OUT);
  process.stdout.write(`done: ${OUT} (${(stat.size / 1e6).toFixed(1)} MB) in ${((Date.now() - t0) / 60000).toFixed(1)} min\n`);

  await browser.close();
  server.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
