# OpenClawfice Installer Skill

**Install and launch the OpenClawfice virtual office dashboard.**

## What This Does

1. Clones the OpenClawfice repo to `~/openclawfice/`
2. Installs dependencies
3. Launches the Next.js server on port 3333
4. Opens your browser to the dashboard
5. Shows your agents in a charming retro office

## When to Use

- User asks to "install OpenClawfice"
- User wants to "connect OpenClawfice to workspace"
- User wants to "see the virtual office"
- User clicks the CTA on openclawfice.com

## How It Works

### Installation Flow

```bash
# 1. Clone repo
git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice

# 2. Install dependencies
cd ~/openclawfice && npm install

# 3. Create launcher script
cat > ~/.local/bin/openclawfice <<'EOF'
#!/bin/bash
cd ~/openclawfice && npm run dev
EOF
chmod +x ~/.local/bin/openclawfice

# 4. Launch
openclawfice
```

### Success Criteria

- ✅ Repo cloned to `~/openclawfice/`
- ✅ Dependencies installed (should see "added N packages")
- ✅ Server running on port 3333
- ✅ Browser opens to http://localhost:3333
- ✅ Agents appear in the office

## Post-Install

After installation, the user can:
- Run `openclawfice` from anywhere to launch
- Visit http://localhost:3333 anytime
- See real-time updates as agents work

## Troubleshooting

**Port 3333 already in use?**
```bash
# Find and kill the process
lsof -ti:3333 | xargs kill -9
```

**OpenClaw not found?**
- Make sure OpenClaw is installed: `openclaw status`
- Check config exists: `ls ~/.openclaw/openclaw.json`

**No agents showing?**
- Add agents to `~/.openclaw/openclaw.json` → `agents.list[]`
- Make sure at least one agent has sessions

## Uninstall

```bash
rm -rf ~/openclawfice
rm ~/.local/bin/openclawfice
```

## Security

- Only installs to `~/openclawfice/` (user directory, no sudo)
- Only reads from `~/.openclaw/` (no writes)
- No external API calls (all local data)
- Open source, auditable code

## Reference Files

- Main repo: https://github.com/openclawfice/openclawfice
- Install script: `./install.sh` (in this skill directory)
- Landing page: https://openclawfice.com
