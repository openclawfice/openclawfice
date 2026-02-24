# First-Time Setup Wizard

**Interactive configuration tool for new OpenClawfice users.**

---

## TL;DR

```bash
# Run the setup wizard
bash bin/first-time-setup.sh

# Or with npm
npm run setup
```

**What it does:** Asks 5 questions, generates `openclawfice.config.json`, starts the app.

---

## When to Use

### First Install
After running the installer, the setup wizard helps you:
- Configure owner name
- Choose chat style (casual/professional/minimal)
- Set chat frequency
- Enable/disable quiet hours
- Toggle sound effects

### Reconfiguration
Run it again anytime to reset your office preferences:
```bash
cd ~/openclawfice
bash bin/first-time-setup.sh
```

It will detect existing config and ask if you want to overwrite.

---

## The 5 Questions

### 1. Owner Name
**Question:** "What's your name? (shown in office)"  
**Default:** Owner  
**Example:** Tyler, Alice, @yourusername

**Where it appears:**
- Office header: "Tyler's Office"
- Quest log: "from Tyler"
- Water cooler: "Tyler says..."

### 2. Chat Style
**Question:** "Water cooler chat style: casual/professional/minimal?"  
**Options:**
- **Casual:** Friendly, emojis, conversational ("Hey team! 🚀")
- **Professional:** Formal, no emojis, business tone ("Update: Task completed.")
- **Minimal:** Ultra-brief, terse ("Done.")

**Default:** Casual

**Example messages:**
- Casual: "Just crushed that bug! 💪 Who's next?"
- Professional: "Bug fix completed. Ready for next assignment."
- Minimal: "Bug fixed."

### 3. Chat Frequency
**Question:** "How often should agents chat?"  
**Options:**
- **Frequent:** 15 seconds (lively, energetic)
- **Normal:** 30 seconds (balanced) ← **default**
- **Occasional:** 60 seconds (calm, focused)
- **Rare:** 2 minutes (minimal distraction)

**Tip:** Start with Normal. Adjust later if it's too chatty or too quiet.

### 4. Quiet Hours
**Question:** "Enable quiet hours? (no chat at night)"  
**Default:** Enabled (11pm - 8am)

**Options:**
- **Yes:** Agents stop chatting during specified hours
- **No:** Chat 24/7

**If enabled, asks:**
- Start hour: 0-23 (default: 23 = 11pm)
- End hour: 0-23 (default: 8 = 8am)

**Use cases:**
- Night owl? Set 2am - 10am
- 9-5 worker? Set 18 - 9
- Always on? Disable it

### 5. Sound Effects
**Question:** "Enable retro sound effects?"  
**Default:** Disabled

**Options:**
- **Yes:** 8-bit sounds for XP, quests, meetings
- **No:** Silent mode

**Sounds include:**
- 📋 Quest added: *bloop*
- ✅ Task completed: *ding*
- 💬 Water cooler message: *chirp*
- ⬆️ Level up: *fanfare*

**Tip:** Enable if you like gamification. Disable if you want focus.

---

## Generated Config

After answering the questions, the wizard creates:

```json
{
  "owner": {
    "name": "Your Name",
    "emoji": "👤"
  },
  "waterCooler": {
    "style": "casual",
    "intervalSeconds": 30,
    "quietHours": {
      "enabled": true,
      "start": 23,
      "end": 8
    }
  },
  "ui": {
    "soundEffects": false,
    "theme": "default"
  },
  "cooldown": {
    "defaultMs": 300000
  }
}
```

**Saved to:** `openclawfice.config.json` (in current directory)

---

## Manual Configuration

**Don't want the wizard? Create the config yourself:**

```bash
# Copy example config
cp openclawfice.config.example.json openclawfice.config.json

# Edit with your preferences
nano openclawfice.config.json
```

**See:** [Configuration Guide](./CONFIGURATION.md) for all options

---

## After Setup

The wizard offers to start OpenClawfice immediately:

```
Setup complete!

Start OpenClawfice now? (Y/n)
```

**Press Y (default):**
- Browser opens to http://localhost:3333
- Office loads with your config
- Agents appear automatically

**Press N:**
- Config saved, ready when you are
- Run `openclawfice` to start later

---

## Troubleshooting

### "OpenClaw not detected"

**Cause:** No `~/.openclaw/openclaw.json` found

**Fix:**
```bash
# Option 1: Install OpenClaw first
# Visit: https://openclaw.ai

# Option 2: Continue anyway (demo mode)
# Press 'y' when prompted
```

### "Config already exists"

**Cause:** You already ran setup before

**Options:**
1. Press 'y' to overwrite (lose current settings)
2. Press 'n' to keep existing config

**If you want to edit config instead of overwriting:**
```bash
nano openclawfice.config.json
# Or open in your editor
```

### "Permission denied"

**Cause:** Script not executable

**Fix:**
```bash
chmod +x bin/first-time-setup.sh
bash bin/first-time-setup.sh
```

### Port Already in Use

**If 3333 is taken:**
```bash
PORT=3334 bash bin/first-time-setup.sh
# Or after setup:
PORT=3334 openclawfice
```

---

## Changing Config Later

### Edit Manually
```bash
# Open config
nano openclawfice.config.json

# Or in VS Code
code openclawfice.config.json

# Save and restart OpenClawfice
```

### Re-run Wizard
```bash
bash bin/first-time-setup.sh
# Press 'y' when asked to overwrite
```

### Reset to Defaults
```bash
# Delete config
rm openclawfice.config.json

# Run wizard again
bash bin/first-time-setup.sh
```

---

## Advanced: Non-Interactive Setup

**Automate setup in scripts:**

```bash
# Create config without prompts
cat > openclawfice.config.json <<EOF
{
  "owner": { "name": "AutoBot" },
  "waterCooler": {
    "style": "minimal",
    "intervalSeconds": 60
  }
}
EOF

# Start immediately
openclawfice
```

**Use case:** CI/CD, Docker containers, automated testing

---

## Adding to Install Script

**Update `public/install.sh` to offer setup wizard:**

```bash
# At the end of install.sh, add:

echo ""
echo "🎉 Installation complete!"
echo ""
read -p "Run first-time setup wizard? (Y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Nn]$ ]]; then
  cd "$INSTALL_DIR"
  bash bin/first-time-setup.sh
else
  echo "Run 'bash ~/openclawfice/bin/first-time-setup.sh' when ready"
fi
```

---

## User Feedback

**After implementing, ask users:**
1. Was setup clear and easy?
2. Did you skip any questions (too many)?
3. What defaults made sense?
4. What would you change?

**Iterate based on real usage patterns.**

---

## Future Enhancements

### Week 1 Post-Launch
- Add `--preset` flag for one-click configs:
  ```bash
  bash bin/first-time-setup.sh --preset=minimal
  bash bin/first-time-setup.sh --preset=power-user
  ```

### Month 1
- Visual setup wizard (web UI instead of CLI)
- Save presets and share with friends
- Import config from URL

### Month 2
- Agent-specific configuration
- Theme picker (dark mode, cyberpunk, cozy)
- Keyboard shortcut customization

---

## Questions?

**Q: Can I skip the wizard?**  
A: Yes. Just create `openclawfice.config.json` manually or copy the example.

**Q: What if I answer wrong?**  
A: Re-run the wizard anytime. Or edit the config file directly.

**Q: Can I change settings after setup?**  
A: Absolutely. Edit `openclawfice.config.json` and restart.

**Q: Does the wizard work on Windows?**  
A: Currently bash-only. Windows users should manually create config (or use WSL).

---

**Last updated:** Feb 24, 2026  
**Script:** `bin/first-time-setup.sh`  
**Priority:** Easy to use (Priority #1)
