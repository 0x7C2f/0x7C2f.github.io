#!/usr/bin/env python3
"""Capture preview frames of the visualizer (headless Chromium via Playwright).

    pip install playwright && python -m playwright install chromium
    python3 preview.py            # -> preview/frame-00.png ... frame-03.png

Frames are grabbed in clean presentation mode (control panel faded out) while
AFTERSHOCK.mp3 plays, so the notebook can display them.
"""
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "preview"


def main():
    """Prefer Python Playwright; otherwise delegate to the bundled preview.js."""
    try:
        import playwright  # noqa: F401
        have_py = True
    except ImportError:
        have_py = False

    node = shutil.which("node")
    if not have_py or not node:
        if not node:
            sys.exit("need node (or pip install playwright) to capture frames")
        sys.exit(subprocess.call([node, str(ROOT / "preview.js")]))

    from playwright.sync_api import sync_playwright
    import functools, http.server, socketserver, threading

    OUT.mkdir(exist_ok=True)
    socketserver.TCPServer.allow_reuse_address = True
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    httpd = socketserver.TCPServer(("127.0.0.1", 8791), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()

    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=[
            "--no-sandbox",
            "--autoplay-policy=no-user-gesture-required",
            "--enable-unsafe-swiftshader",
            "--mute-audio",
        ])
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto("http://127.0.0.1:8791/index.html?audio=/AFTERSHOCK.mp3", wait_until="load")
        page.wait_for_timeout(2500)
        page.keyboard.press("v")
        for i in range(4):
            page.wait_for_timeout(6000)
            path = OUT / f"frame-{i:02d}.png"
            page.screenshot(path=str(path))
            print("saved", path)
        state = page.evaluate("() => ({mode: window.FluidAudio.state.mode, "
                              "t: window.FluidAudio.state.mediaEl.currentTime, "
                              "beats: window.FluidAudio.state.beatCount})")
        print("state:", state)
        browser.close()

    httpd.shutdown()


if __name__ == "__main__":
    main()
