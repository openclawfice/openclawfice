#!/bin/bash
# Kills the dev server, nukes .next, and restarts with Turbopack
DIR="$(cd "$(dirname "$0")" && pwd)"
lsof -ti :3333 | xargs kill -9 2>/dev/null
sleep 1
rm -rf "$DIR/.next"
cd "$DIR" && exec npx next dev --port 3333 --turbopack
