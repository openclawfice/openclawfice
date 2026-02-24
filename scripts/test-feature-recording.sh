#!/bin/bash
# Test the feature-aware recording system

echo "🧪 Testing feature-aware accomplishment recording"
echo ""

# Ensure OpenClawfice is running
if ! curl -s http://localhost:3333 >/dev/null 2>&1; then
  echo "❌ OpenClawfice not running at localhost:3333"
  echo "   Start it with: npm run dev"
  exit 1
fi

echo "✅ OpenClawfice is running"
echo ""

# Test 1: XP celebration
echo "1️⃣ Testing XP celebration recording..."
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"🎉",
      "title":"Test: XP celebration animation",
      "detail":"Should trigger XP popup in video",
      "who":"Scout",
      "featureType":"xp-celebration"
    }
  }' | jq -r '.success'

sleep 2

# Test 2: Quest panel
echo "2️⃣ Testing quest panel recording..."
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"📋",
      "title":"Test: Quest panel view",
      "detail":"Should show quest panel clearly",
      "who":"Scout",
      "featureType":"quest-panel"
    }
  }' | jq -r '.success'

sleep 2

# Test 3: Chat message
echo "3️⃣ Testing chat message recording..."
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"💬",
      "title":"Test: Chat interaction",
      "detail":"Should send demo message and record it",
      "who":"Scout",
      "featureType":"chat"
    }
  }' | jq -r '.success'

sleep 2

# Test 4: Auto-inference (no featureType specified)
echo "4️⃣ Testing auto-inference from title..."
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"✨",
      "title":"Added XP celebration animations",
      "detail":"Should auto-detect as xp-celebration from title",
      "who":"Scout"
    }
  }' | jq -r '.success'

echo ""
echo "✅ Test accomplishments sent"
echo ""
echo "📹 Recordings will take 8-10 seconds each"
echo "   Watch the browser window - it should:"
echo "   - Focus OpenClawfice tab"
echo "   - Enter fullscreen"
echo "   - Trigger demo action (XP popup, chat message, etc)"
echo "   - Record for 8 seconds"
echo "   - Exit fullscreen"
echo ""
echo "Videos saved to: ~/.openclaw/.status/screenshots/"
echo ""
echo "To view results:"
echo "  ls -lh ~/.openclaw/.status/screenshots/*.mp4 | tail -4"
echo "  open ~/.openclaw/.status/screenshots/"
