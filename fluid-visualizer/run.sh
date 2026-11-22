#!/usr/bin/env bash
# Serve the visualizer locally (WebGL + audio need http://, not file://).
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-8080}"

URL="http://127.0.0.1:${PORT}/index.html"
echo "fluid music visualizer → ${URL}"
echo "press Ctrl-C to stop"

if command -v python3 >/dev/null 2>&1; then
    ( sleep 1; xdg-open "${URL}" >/dev/null 2>&1 || true ) &
    exec python3 -m http.server "${PORT}" --bind 127.0.0.1
elif command -v node >/dev/null 2>&1; then
    exec npx --yes http-server -a 127.0.0.1 -p "${PORT}" -c-1 .
else
    echo "need python3 or node to serve files" >&2
    exit 1
fi
