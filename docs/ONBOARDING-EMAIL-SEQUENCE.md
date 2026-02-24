# Onboarding Email Sequence

**Purpose:** Drive retention and engagement after users install OpenClawfice

**Trigger:** User runs `npx openclawfice` for the first time

**Goal:** 80%+ of users try core features within first week

---

## Email 1: Welcome + First 5 Minutes (Immediate)

**Sent:** Immediately after first run  
**Goal:** Get user to see their first agent status  
**Success metric:** User opens app and sees agent dashboard

### Subject Line Options

**Option A (Direct):**
```
✅ OpenClawfice is running! Here's what to do next
```

**Option B (Benefit):**
```
Your AI agents just got a lot more fun to manage 🎮
```

**Option C (Curiosity):**
```
Wait until you see what your agents are doing right now...
```

**Recommended:** Option A (clear, actionable)

---

### Email Body

```
Hey there! 👋

Thanks for installing OpenClawfice!

Your pixel art office is now running at:
http://localhost:3333

Here's what to do in the next 5 minutes:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Open your office (10 seconds)
→ Click: http://localhost:3333

You should see your agents as pixel art NPCs in an office.

STEP 2: Click on an agent (20 seconds)
→ Click any NPC to see their detail panel
→ Check their current task, skills, and XP

STEP 3: Check the Quest Log (30 seconds)
→ Look for the "⚔️ QUEST LOG" panel
→ This is where agent decisions appear
→ Try approving or declining a quest

STEP 4: Watch the accomplishments (1 minute)
→ See what your agents shipped recently
→ New accomplishments appear in real-time

STEP 5: Explore the rooms (2 minutes)
→ Work Room: Agents currently working
→ Lounge: Agents on cooldown
→ Meeting Room: Agent discussions (if active)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎮 Why this is cool:

Instead of grep'ing logs and running status commands,
you get a live dashboard that's actually fun to look at.

It's like The Sims meets DevOps.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Quick tips:

• Leave it running in a browser tab
• Check it when you hear XP celebration sounds
• Star the repo: https://github.com/openclawfice/openclawfice
• Join Discord for updates: [link]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Hit reply or open an issue:
https://github.com/openclawfice/openclawfice/issues

Enjoy your new agent office!

— The OpenClawfice Team 🚀

P.S. Tomorrow I'll show you the meeting room feature.
It's my favorite part.
```

**CTA:** Open http://localhost:3333

---

## Email 2: Day 2 - Meeting Room Feature (24 hours later)

**Sent:** 24 hours after first run  
**Goal:** Get user to try meeting room  
**Success metric:** User creates a meeting

### Subject Line Options

**Option A (Feature hook):**
```
Your agents can hold meetings now 🤝
```

**Option B (Benefit):**
```
Watch your agents debate decisions in real-time
```

**Option C (FOMO):**
```
You're missing the coolest OpenClawfice feature
```

**Recommended:** Option A (clear value prop)

---

### Email Body

```
Hey again! 👋

Quick question: Have you tried the Meeting Room yet?

It's where your agents discuss decisions BEFORE bothering you.

Here's what it looks like in action:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤝 THE MEETING ROOM

Instead of this:
❌ Agent: "Should we use PostgreSQL or SQLite?"
❌ You: *researches for 30 minutes*

You get this:
✅ Agent 1: "I think PostgreSQL — better for scale"
✅ Agent 2: "True, but SQLite is simpler for local dev"
✅ Agent 1: "Fair point. Let's do PostgreSQL + Docker"
✅ Quest appears: "Team recommends PostgreSQL. Approve?"

Your agents debate it. You just approve the recommendation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO TRY IT (2 minutes):

1. Open OpenClawfice: http://localhost:3333

2. Click the "📞 Call Meeting" button in the header

3. Pick 2+ participants (your agents)

4. Enter a topic: "How should we prioritize this week?"

5. Click "Start Meeting"

6. Watch the meeting room appear with live discussion

The transcript shows the full back-and-forth conversation
between your agents, color-coded by speaker.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 WHY THIS MATTERS:

Decision-making is usually YOUR bottleneck.

With meeting rooms, agents discuss → reach consensus → 
present you with a recommendation.

You approve/override in 10 seconds instead of researching
for 30 minutes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 TRY IT TODAY:

Create a meeting about something your agents are working on.
See how they discuss it.

Even if you don't use it regularly, it's worth seeing once.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Reply to this email.

Tomorrow: I'll show you how to share your office on Twitter.

— The OpenClawfice Team 🚀

P.S. If meetings aren't your thing, that's cool too.
The core dashboard is the main value. Meetings are a bonus.
```

**CTA:** Create your first meeting

---

## Email 3: Day 7 - Share Feature + Community (7 days later)

**Sent:** 7 days after first run  
**Goal:** Get user to share on social media  
**Success metric:** User generates share card or tweets about it

### Subject Line Options

**Option A (Social):**
```
Show off your agent office 📸
```

**Option B (Vanity):**
```
Your OpenClawfice setup is worth sharing
```

**Option C (Community):**
```
Join 500+ people using OpenClawfice
```

**Recommended:** Option A (actionable)

---

### Email Body

```
Hey! 👋

You've been using OpenClawfice for a week now.

Want to show off your setup?

Here's how to create a shareable office card in 30 seconds:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📸 CREATE YOUR OFFICE CARD

1. Open OpenClawfice: http://localhost:3333

2. Click the camera icon (📸) in the top right

3. Your office card generates automatically:
   • Shows your agents working
   • Displays stats (quests, accomplishments, XP)
   • Includes your top agent on the leaderboard
   • Beautiful pixel art aesthetic

4. Click "Download PNG" or "Copy Image"

5. Post on Twitter/Reddit/Discord with:
   "My AI agent office 🏢 [X] agents, [Y] things shipped this week"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 WHY SHARE?

1. It's just cool — pixel art agent offices are fun
2. Help others discover OpenClawfice
3. Get feedback on your agent setup
4. Inspire others with your workflow

Plus: We reshare the best offices on @openclawfice!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 JOIN THE COMMUNITY

[X] people are using OpenClawfice now. Join us:

• Discord: [link] — Share setups, ask questions, get help
• Twitter: @openclawfice — Latest features and updates
• GitHub: Star the repo to follow development
• Reddit: r/OpenClaw — Weekly showcase threads

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎁 BONUS: WEEK 1 TIPS

Here are 3 things power users do:

1. **Keyboard Shortcuts**
   • Press `?` to see all shortcuts
   • `M` = Create meeting
   • `S` = Share card
   • `L` = Open leaderboard

2. **Customize Your Agents**
   • Edit openclawfice.config.json
   • Change colors, names, roles
   • Set cooldown timers
   • Configure meeting preferences

3. **Track Progress**
   • Check `/leaderboard` to see top agents
   • Review accomplishments for weekly wins
   • Use quest log to spot bottlenecks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 WHAT'S NEXT?

We're shipping new features every week:
• Daily agent challenges
• Office customization
• Multi-user support
• Mobile app

Star the repo to stay updated:
https://github.com/openclawfice/openclawfice

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thanks for using OpenClawfice! 🙏

If you have feature requests, open a GitHub issue.
If you just want to share your setup, hit reply.

We read everything.

— The OpenClawfice Team 🚀

P.S. Seriously, create a share card. It takes 30 seconds
and looks way cooler than you think.
```

**CTA:** Create and share your office card

---

## Implementation Notes

### Triggering Emails

**Option 1: Manual (Post-Launch v1)**
- Create mailing list signup on openclawfice.com
- Send emails manually via Mailchimp/ConvertKit
- Low tech, easy to start

**Option 2: Automated (v0.2)**
- Add email collection to first-run setup
- Integrate with email service API
- Trigger based on user actions

**Option 3: In-App (v0.3)**
- Show tooltips/modals instead of emails
- Driven by localStorage flags
- No email required

**Recommended for launch:** Option 1 (manual)

---

### Email Service Setup

**Free tier options:**
- Mailchimp: 500 contacts free
- ConvertKit: 1K subscribers free
- Sendinblue: 300 emails/day free

**Sequence setup:**
1. Create 3 campaigns
2. Set delay triggers (0h, 24h, 7d)
3. Track open rates and clicks
4. A/B test subject lines

---

### Success Metrics

**Email 1 (Welcome):**
- Open rate: 60%+ (immediate = high)
- Click rate: 40%+ (click localhost link)
- Success: User opens app within 1 hour

**Email 2 (Meeting Room):**
- Open rate: 40%+ (day 2 = medium)
- Click rate: 20%+ (try meeting feature)
- Success: User creates first meeting

**Email 3 (Share):**
- Open rate: 30%+ (day 7 = lower)
- Click rate: 10%+ (create share card)
- Success: User posts on social media

---

### A/B Test Ideas

**Subject lines:**
- Emoji vs no emoji
- Question vs statement
- Benefit vs feature

**Body copy:**
- Long vs short
- GIFs vs text
- Technical vs casual tone

**CTAs:**
- Button vs link
- Multiple vs single
- Urgent vs patient

---

## Copy Guidelines

### Tone
- Casual but not juvenile
- Helpful but not pushy
- Technical but not jargon-heavy
- Excited but not salesy

### Structure
- Use visual breaks (━━━━)
- Keep paragraphs short (2-3 lines max)
- Lead with benefit, not feature
- Always include an easy out ("If X isn't your thing, that's cool")

### Personalization
- Use "you" and "your"
- Refer to their agents specifically
- Acknowledge time investment ("You've been using for a week")
- Make them feel like insiders

---

## Template Variables

**To implement dynamic content:**

```
{{user_name}}
{{agent_count}}
{{top_agent_name}}
{{top_agent_xp}}
{{accomplishment_count}}
{{days_since_install}}
{{leaderboard_position}}
```

**Example:**
```
Hey {{user_name}}!

Your {{agent_count}} agents have shipped {{accomplishment_count}} things
this week. {{top_agent_name}} is crushing it with {{top_agent_xp}} XP!
```

---

## Unsubscribe Copy

**Footer for all emails:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're getting this because you installed OpenClawfice.

Don't want tips? No worries — [Unsubscribe here]

OpenClawfice is open source and free forever.
https://github.com/openclawfice/openclawfice
```

---

## Future Sequence Ideas

**Week 2-4: Advanced Features**
- Email 4 (Day 14): Customization guide
- Email 5 (Day 21): Power user tips
- Email 6 (Day 28): "What's new" update

**Triggered by behavior:**
- "We noticed you haven't opened OpenClawfice in 7 days"
- "Congrats on your first 1000 XP!"
- "Your agent just hit level 20!"

**Seasonal/Event-based:**
- Monthly feature roundup
- Community showcase (best offices)
- Holiday themes ("Spooky office skins for Halloween")

---

**Status:** Ready for implementation  
**Next step:** Set up email service + create campaigns  
**Timeline:** Can launch alongside product (day 0)

---

**Last updated:** Feb 24, 2026  
**Version:** 1.0
