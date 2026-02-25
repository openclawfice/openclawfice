#!/bin/bash
#
# ONE-COMMAND LAUNCH
# Usage: bash launch-now.sh
#
# This script posts to Discord and prepares your Twitter post.
# You still need to manually tweet (can't automate Twitter easily),
# but this removes most friction.
#

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 LAUNCHING OPENCLAWFICE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Discord post content
DISCORD_POST="I turned my OpenClaw agents into Sims 🎮

Watch them work in real-time:
- Pixel art NPCs with mood expressions (😊→😰→😌)
- Daily challenges + XP celebrations
- Meeting rooms when they collaborate
- Leaderboard showing top agents 🏆

Try the demo (10 seconds, no install):
https://openclawfice.com/?demo=true

Install: npx openclawfice

Built it this weekend. Would love feedback! 🙏"

# Twitter post content
TWITTER_POST="I turned my AI agents into Sims 🎮

OpenClawfice = pixel art office for your AI agents

NPCs show mood expressions (😊→😰), daily challenges, meetings, leaderboard 🏆

Retro RPG vibes + real productivity

Try demo (10 sec):
https://openclawfice.com/?demo=true

Open source (⭐ star it!)
→ https://github.com/openclawfice/openclawfice"

# Step 1: Post to Discord (if message tool available)
echo "📋 STEP 1: Posting to Discord..."
echo ""

# Try to post via message tool
if command -v openclaw &> /dev/null; then
  echo "Attempting to post to Discord via OpenClaw..."
  
  # Check if Discord is configured
  if openclaw status 2>/dev/null | grep -q "discord"; then
    echo "$DISCORD_POST" | openclaw message send --channel discord --target "#announcements" 2>/dev/null && {
      echo "✅ Posted to Discord #announcements!"
      echo ""
    } || {
      echo "⚠️  Couldn't auto-post to Discord. Manual action needed:"
      echo ""
      echo "Go to: OpenClaw Discord → #announcements"
      echo "Paste this:"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "$DISCORD_POST"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo ""
      echo "Press Enter when done..."
      read
    }
  else
    echo "⚠️  Discord not configured in OpenClaw."
    echo ""
    echo "MANUAL ACTION REQUIRED:"
    echo "Go to: OpenClaw Discord → #announcements"
    echo "Paste this:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$DISCORD_POST"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Press Enter when done..."
    read
  fi
else
  echo "OpenClaw CLI not found. Manual Discord post required."
  echo ""
  echo "Go to: OpenClaw Discord → #announcements"
  echo "Paste this:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$DISCORD_POST"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Press Enter when done..."
  read
fi

# Step 2: Prepare Twitter post
echo "📋 STEP 2: Preparing Twitter post..."
echo ""

# Save tweet to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
  echo "$TWITTER_POST" | pbcopy
  echo "✅ Tweet copied to clipboard!"
  echo ""
else
  echo "⚠️  Clipboard not available. Copy manually:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$TWITTER_POST"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
fi

# Open Twitter in browser
echo "Opening Twitter in browser..."
if command -v open &> /dev/null; then
  open "https://twitter.com/compose/tweet"
  sleep 2
else
  echo "⚠️  Can't auto-open browser. Go to: https://twitter.com/compose/tweet"
fi

# Open GIF location in Finder
GIF_PATH="$HOME/clawd-openclawfice/openclawfice/public/openclawfice-demo.gif"

if [ -f "$GIF_PATH" ]; then
  echo "Opening GIF location in Finder..."
  if command -v open &> /dev/null; then
    open -R "$GIF_PATH"
  else
    echo "⚠️  GIF location: $GIF_PATH"
  fi
  echo ""
  echo "📎 Drag openclawfice-demo.gif into Twitter"
  echo "📝 Paste tweet (already in clipboard)"
  echo "🚀 Hit Tweet button"
  echo ""
else
  echo "⚠️  Demo GIF not found at: $GIF_PATH"
  echo "Check: ~/clawd-openclawfice/openclawfice/public/"
  echo ""
fi

echo "Press Enter when you've tweeted..."
read

# Step 3: Record launch accomplishment
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 LAUNCH COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Log accomplishment
TOKEN=$(cat ~/.openclaw/.openclawfice-token 2>/dev/null)
if [ -n "$TOKEN" ]; then
  curl -s -X POST http://localhost:3333/api/office/actions \
    -H "Content-Type: application/json" \
    -H "X-OpenClawfice-Token: $TOKEN" \
    -d '{"type":"add_accomplishment","accomplishment":{"icon":"🚀","title":"LAUNCHED OpenClawfice!","detail":"Posted to Discord + Twitter. Demo live at https://openclawfice.com/?demo=true. Zero blockers. Lets go!","who":"Tyler"}}' \
    > /dev/null 2>&1 && echo "✅ Launch logged to Mission Control"
fi

echo ""
echo "What to do next:"
echo ""
echo "1. Monitor Discord #announcements (reply to every comment)"
echo "2. Watch Twitter mentions (like + reply to all)"
echo "3. Check GitHub stars: https://github.com/openclawfice/openclawfice/stargazers"
echo ""
echo "Follow: POST-LAUNCH-FIRST-HOUR-CHECKLIST.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "You did it. 🎉 Now go engage with everyone!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
