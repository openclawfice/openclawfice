#!/usr/bin/env bash
# Get OpenClawfice auth token for API calls
#
# Usage:
#   source scripts/get-token.sh
#   echo $TOKEN
#
# Or:
#   TOKEN=$(bash scripts/get-token.sh)

# Method 1: Read from file (fastest, most reliable)
if [ -f ~/.openclaw/.openclawfice-token ]; then
    cat ~/.openclaw/.openclawfice-token
    exit 0
fi

# Method 2: Get from API endpoint (requires server running)
TOKEN=$(curl -s http://localhost:3333/api/auth/token 2>/dev/null | jq -r '.token' 2>/dev/null)
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "$TOKEN"
    exit 0
fi

# Method 3: Fail with helpful error
echo "Error: Could not get OpenClawfice token" >&2
echo "Make sure OpenClawfice is running: npm run dev" >&2
exit 1
