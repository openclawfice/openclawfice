#!/bin/bash
# Kills the dev server, nukes .next, and restarts with webpack dev server
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
lsof -ti :3333 | xargs kill -9 2>/dev/null
sleep 1
rm -rf "$ROOT_DIR/.next"
cd "$ROOT_DIR" && exec npx next dev --port 3333
