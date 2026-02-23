#!/bin/bash

# Test Demo Mode Simulation
# This script polls the demo API and shows agents + chat changing over time

echo "🎮 Testing OpenClawfice Demo Mode Simulation"
echo "=============================================="
echo ""
echo "This will poll the demo API 5 times with 5-second intervals."
echo "Watch for agents changing status/tasks and new chat messages appearing."
echo ""

for i in {1..5}; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Poll #$i ($(date +%H:%M:%S))"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  # Show agents
  echo "📊 Agents:"
  curl -s http://localhost:3333/api/demo | jq -r '.agents[] | "  \(.emoji) \(.name): \(.status) - \(.task // "idle")"'
  
  echo ""
  
  # Show last 3 chat messages
  echo "💬 Water Cooler (last 3 messages):"
  curl -s http://localhost:3333/api/demo/chat | jq -r '.messages[-3:] | .[] | "  \(.from): \(.text)"'
  
  echo ""
  
  if [ $i -lt 5 ]; then
    echo "Waiting 5 seconds..."
    sleep 5
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test complete!"
echo ""
echo "Expected behavior:"
echo "  • Agents should change status (working ↔ idle)"
echo "  • Working agents should get new tasks"
echo "  • Chat should show new messages over time"
echo ""
echo "Try the full demo at: http://localhost:3333/?demo=true"
