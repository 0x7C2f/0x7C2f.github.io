#!/usr/bin/env node
/**
 * Capture preview frames of the visualizer with headless Chromium.
 *
 *   node preview.js            -> preview/frame-00.png ..
 *
 * Uses whichever Playwright / Chromium install is available, so it works even
 * when Python's playwright package is missing (preview.py shells out to this).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'preview');
const PORT = 8792;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png',
  '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
};

function loadPlaywright() {
  const candidates = [
    'playwright', 'playwright-core',
    path.join(process.env.HOME || '', 'node_modules', 'playwright-core'),
    path.join(process.env.HOME || '', 'node_modules', 'playwright'),
  ];
  for (const c of candidates) {
    try { return require(c); } catch (e) { /* next */ }
  }
  return null;
}

function findChromium(pw) {
  const local = path.join(process.env.HOME || '', '.cache', 'ms-playwright');
  try {
    for (const dir of fs.readdirSync(local).sort().reverse()) {
      if (!dir.startsWith('chromium-')) continue;
      for (const rel of ['chrome-linux64/chrome', 'chrome-linux/chrome']) {
        const exe = path.join(local, dir, rel);
        if (fs.existsSync(exe)) return exe;
      }
    }
  } catch (e) { /* ignore */ }
  for (const exe of ['/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/chromium-browser']) {
    if (fs.existsSync(exe)) return exe;
  }
  return null;
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, url === '/' ? 'index.html' : url);
  fs.stat(file, (err, st) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    const type = MIME[path.extname(file)] || 'application/octet-stream';
    const range = req.headers.range;
    if (range && st.size) {
      const m = /bytes=(\d+)-(\d*)/.exec(range);
      const start = +m[1];
      const end = m[2] ? +m[2] : st.size - 1;
      res.writeHead(206, {
        'Content-Type': type,
        'Content-Range': `bytes ${start}-${end}/${st.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
      });
      fs.createReadStream(file, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': st.size });
      fs.createReadStream(file).pipe(res);
    }
  });
});

(async () => {
  const pw = loadPlaywright();
  if (!pw) {
    console.error('Playwright not found. Try: npm i -g playwright && npx playwright install chromium');
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));

  const exe = findChromium(pw);
  const browser = await pw.chromium.launch({
    ...(exe ? { executablePath: exe } : {}),
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required',
           '--enable-unsafe-swiftshader', '--mute-audio'],
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`http://127.0.0.1:${PORT}/index.html?audio=/AFTERSHOCK.mp3`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  // clean presentation mode
  await page.keyboard.press('v');
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(6000);
    const file = path.join(OUT, `frame-${String(i).padStart(2, '0')}.png`);
    await page.screenshot({ path: file });
    process.stdout.write(`saved ${file}\n`);
  }
  const state = await page.evaluate(() => ({
    mode: window.FluidAudio.state.mode,
    t: +window.FluidAudio.state.mediaEl.currentTime.toFixed(1),
    beats: window.FluidAudio.state.beatCount,
  }));
  process.stdout.write(`state: ${JSON.stringify(state)}\n`);

  await browser.close();
  server.close();
})().catch(err => { console.error('failed:', err.message); process.exit(1); });
