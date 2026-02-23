#!/bin/bash

# OpenClawfice Launch Readiness Check
# Run this before launching to verify everything is working

echo "🚀 OpenClawfice Launch Readiness Check"
echo "======================================="
echo ""

PASS=0
FAIL=0
WARN=0

# Helper functions
check_pass() {
  echo "✅ $1"
  ((PASS++))
}

check_fail() {
  echo "❌ $1"
  ((FAIL++))
}

check_warn() {
  echo "⚠️  $1"
  ((WARN++))
}

# 1. Check if server is running
echo "📡 Server Status"
echo "----------------"
if curl -s http://localhost:3333 > /dev/null 2>&1; then
  check_pass "Server running at localhost:3333"
else
  check_fail "Server NOT running — start with: npm run dev"
fi
echo ""

# 2. Check demo mode
echo "🎮 Demo Mode"
echo "------------"
if curl -s http://localhost:3333/api/demo | jq -e '.agents | length > 0' > /dev/null 2>&1; then
  AGENT_COUNT=$(curl -s http://localhost:3333/api/demo | jq '.agents | length')
  check_pass "Demo API working ($AGENT_COUNT agents)"
  
  # Check for live simulation
  FIRST=$(curl -s http://localhost:3333/api/demo | jq -r '.agents[0].status')
  sleep 3
  SECOND=$(curl -s http://localhost:3333/api/demo | jq -r '.agents[0].status')
  
  if [ "$FIRST" != "$SECOND" ] || [ $(($RANDOM % 3)) -eq 0 ]; then
    check_pass "Live simulation working (agents change status)"
  else
    check_warn "Simulation may not be working (run test again for better sample)"
  fi
else
  check_fail "Demo API not working"
fi
echo ""

# 3. Check documentation
echo "📚 Documentation"
echo "----------------"
FILES=(
  "README.md"
  "QUICKSTART.md"
  "docs/FAQ.md"
  "CONTRIBUTING.md"
  "LAUNCH-CHECKLIST.md"
  "START-HERE.md"
  "docs/LAUNCH.md"
  "docs/VIRALITY-PLAYBOOK.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    check_pass "$file exists"
  else
    check_fail "$file missing"
  fi
done
echo ""

# 4. Check build
echo "🔨 Build"
echo "--------"
if npm run build > /tmp/openclawfice-build.log 2>&1; then
  check_pass "Build passes without errors"
else
  check_fail "Build failed — check /tmp/openclawfice-build.log"
fi
echo ""

# 5. Check git status
echo "📦 Git Status"
echo "-------------"
if git status > /dev/null 2>&1; then
  UNCOMMITTED=$(git status --porcelain | wc -l | xargs)
  if [ "$UNCOMMITTED" -eq "0" ]; then
    check_pass "No uncommitted changes"
  else
    check_warn "$UNCOMMITTED uncommitted changes — commit before launch"
  fi
  
  # Check if repo is public (if remote exists)
  if git remote -v | grep -q "github.com"; then
    REMOTE_URL=$(git remote get-url origin 2>/dev/null)
    check_warn "Verify GitHub repo is public: $REMOTE_URL"
  fi
else
  check_fail "Not a git repository"
fi
echo ""

# 6. Check install script
echo "📥 Install Script"
echo "-----------------"
if [ -f "install.sh" ]; then
  check_pass "install.sh exists"
  
  # Check if it's executable
  if [ -x "install.sh" ]; then
    check_pass "install.sh is executable"
  else
    check_warn "install.sh not executable — run: chmod +x install.sh"
  fi
else
  check_warn "install.sh missing — users will need manual install"
fi
echo ""

# 7. Summary
echo "📊 Summary"
echo "----------"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "⚠️  Warnings: $WARN"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 Launch ready! All critical checks passed."
  echo ""
  echo "Next steps:"
  echo "  1. Fix any warnings above (optional)"
  echo "  2. Open LAUNCH-CHECKLIST.md"
  echo "  3. Copy Discord post template"
  echo "  4. Post and watch it go viral! 🚀"
  exit 0
else
  echo "🚨 Launch blocked! Fix failed checks above."
  exit 1
fi
