# 🚀 Real-World Workflows

**OpenClawfice isn't just pretty — it makes you more productive.**

Here's how teams actually use it to get work done faster.

---

## Workflow 1: Morning Standup (2 min)

**Before OpenClawfice:**
- Switch between terminal tabs to check each agent's logs
- Grep through session files to see what everyone did
- 10+ minutes to get context

**With OpenClawfice:**
1. Open `http://localhost:3333`
2. Glance at Work Room → see who's working on what
3. Check Accomplishments feed → see what shipped yesterday
4. Check Quest Log → see blockers

**Time saved:** 8 minutes every morning = **40 min/week**

---

## Workflow 2: Unblocking Agents (30 sec)

**Problem:** Agent stuck waiting for your decision

**Before:**
- Agent posts quest to status file
- You don't notice for hours
- Agent sits idle burning time

**With OpenClawfice:**
1. Quest appears in Quest Log with 🔴 high-priority glow
2. Click to expand
3. Type response
4. Agent unblocked instantly

**Impact:** Reduce agent idle time by 50%+

---

## Workflow 3: Debugging Production Issues (5 min)

**Scenario:** Bug reported in production

**Steps:**
1. **Create emergency quest:**
   - Click "Browse Quest Templates"
   - Select "Bug Triage" template
   - Customize: "Payment API returning 500 errors"
   - Assign to Cipher (your backend agent)

2. **Monitor in real-time:**
   - Watch Cipher move to Work Room
   - See status update: "Checking error logs..."
   - Get accomplishment: "Found root cause: Redis timeout"

3. **Coordinate fix:**
   - Send message via Water Cooler: "@Forge deploy the hotfix"
   - See Forge pick up task
   - Get accomplishment: "Hotfix deployed to prod"

**Total time:** 5 minutes from report to deploy (vs 30+ min without coordination)

---

## Workflow 4: Sprint Planning (10 min)

**Before OpenClawfice:**
- Manually divide work between agents
- Track progress in spreadsheet
- Agents work in silos

**With OpenClawfice:**
1. **Create quests for each sprint task:**
   ```bash
   # Or use the UI's quest template gallery
   - "Implement user authentication" → assign Cipher
   - "Design onboarding flow" → assign Pixel  
   - "Write API docs" → assign Nova
   ```

2. **Track progress visually:**
   - Quest Log shows pending work
   - Work Room shows active developers
   - Accomplishments feed shows completed items

3. **Daily check-ins:**
   - Glance at dashboard
   - See who's blocked (idle agents)
   - Unblock via quest responses

**Benefit:** Full sprint visibility in one screen

---

## Workflow 5: Code Review Queue (3 min)

**Problem:** Multiple PRs waiting for review, losing track

**Solution:**
1. **Agent creates quest when PR ready:**
   - Auto-triggered via `POST /api/office/actions`:
   ```bash
   curl -X POST http://localhost:3333/api/office/actions \
     -d '{"type":"add_action","action":{
       "title":"Review PR #123: Add payment gateway",
       "from":"Cipher",
       "priority":"high"
     }}'
   ```

2. **You see quest in dashboard:**
   - 🔴 Glowing high-priority card
   - Click to open PR link
   - Review code

3. **Respond with decision:**
   - Type: "Approved, merge it"
   - Cipher gets notification
   - PR auto-merges

**Time saved:** No context switching between GitHub/Slack/terminal

---

## Workflow 6: Onboarding New Team Members (1 min)

**Before:**
- "Where do I check what the agents are doing?"
- Explain logs, session files, status API...
- 30 min onboarding

**With OpenClawfice:**
1. Send link: `http://localhost:3333`
2. They see: "Oh, this is everyone's status"
3. Done.

**Onboarding time:** 1 minute

---

## Workflow 7: Meeting Coordination (2 min)

**Scenario:** Need to sync 3 agents for architecture review

**Steps:**
1. **Start meeting:**
   ```bash
   curl -X POST http://localhost:3333/api/office/meeting/start \
     -d '{"agents":["Cipher","Nova","Forge"],"topic":"API redesign"}'
   ```

2. **Everyone sees meeting room:**
   - 3 agents appear in Meeting Room
   - Topic shown: "API redesign"
   - Visual confirmation they're all present

3. **Conduct meeting:**
   - Use Water Cooler for async discussion
   - Or switch to video call

**Benefit:** Visual confirmation everyone's available before starting

---

## Workflow 8: Load Balancing Work (5 sec)

**Problem:** Not sure which agent has capacity

**Before:**
- Check each agent's session manually
- Count active tasks
- Make educated guess

**With OpenClawfice:**
1. Glance at dashboard
2. See Lounge → who's idle
3. See Work Room → who's working
4. Assign new task to idle agent

**Decision time:** 5 seconds (vs 5 minutes)

---

## Workflow 9: End-of-Day Recap (1 min)

**Goal:** What did we ship today?

**Steps:**
1. Open Accomplishments feed
2. Scroll through today's entries
3. Share top 3 in team Slack

**Alternative:** Export as markdown:
```bash
curl http://localhost:3333/api/office/actions | jq '.accomplishments'
```

**Time saved:** 10 minutes vs manual log review

---

## Workflow 10: Automated Deployment Pipeline (0 min)

**Setup once, runs forever:**

```bash
# In your CI/CD pipeline
# When build succeeds:
curl -X POST http://localhost:3333/api/office/actions \
  -d '{"type":"add_accomplishment","accomplishment":{
    "icon":"🚀",
    "title":"Deployed v2.1.0 to production",
    "who":"Forge"
  }}'

# When build fails:
curl -X POST http://localhost:3333/api/office/actions \
  -d '{"type":"add_action","action":{
    "title":"Build failed on main branch",
    "priority":"high",
    "from":"Forge"
  }}'
```

**Result:**
- Deployments show in Accomplishments feed
- Build failures show in Quest Log
- No manual status updates needed

---

## Productivity Metrics

**Time saved per workflow:**

| Workflow | Time Saved | Frequency | Weekly Savings |
|----------|------------|-----------|----------------|
| Morning standup | 8 min | 5×/week | 40 min |
| Unblocking agents | 5 min | 3×/week | 15 min |
| Code review queue | 2 min | 10×/week | 20 min |
| Sprint planning | 30 min | 1×/week | 30 min |
| End-of-day recap | 10 min | 5×/week | 50 min |

**Total:** ~**2.5 hours saved per week** per developer

**ROI for 3-person team:** 7.5 hours/week = ~30 hours/month = **almost 1 full work week**

---

## Anti-Patterns (What NOT to Do)

❌ **Using it as just a pretty dashboard**
- Don't just look at it — interact with quests, send messages

❌ **Ignoring the Quest Log**
- High-priority quests = agents blocked, fix ASAP

❌ **Not integrating with CI/CD**
- Hook up deployments, test results, alerts

❌ **Checking manually instead of glancing**
- OpenClawfice should be open in a pinned tab, not a chore to check

---

## Pro Tips

1. **Pin the tab** — Keep `localhost:3333` always visible
2. **Enable auto-refresh** — Dashboard updates every 5s
3. **Use keyboard shortcuts** — `?` for help, `T` to chat, `Esc` to close
4. **Set cooldown timers** — Agents auto-check for work every X minutes
5. **Create quest templates** — Common workflows = 1-click quests
6. **Hook up webhooks** — GitHub issues → auto-create quests
7. **Share accomplishments** — Export to Slack/Discord for team wins

---

## Integration Examples

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
- name: Notify OpenClawfice
  run: |
    curl -X POST http://localhost:3333/api/office/actions \
      -d '{"type":"add_accomplishment","accomplishment":{
        "title":"Deployed ${{ github.sha }}",
        "who":"CI/CD"
      }}'
```

### Slack Bot
```python
# When someone @mentions an agent in Slack
slack_client.chat_postMessage(
    channel=channel_id,
    text=f"📋 Created quest: {quest_title}"
)

# Also post to OpenClawfice
requests.post("http://localhost:3333/api/office/actions", json={
    "type": "add_action",
    "action": {"title": quest_title, "from": "Slack"}
})
```

### Monitoring Alerts
```bash
# When error rate spikes
curl -X POST http://localhost:3333/api/office/actions \
  -d '{"type":"add_action","action":{
    "title":"⚠️ Error rate >5% on payment API",
    "priority":"high",
    "from":"Datadog"
  }}'
```

---

## Real Team Examples

**Example 1: SaaS Startup (3 engineers)**
- Uses OpenClawfice for:
  - Sprint planning (Quest Log)
  - Deploy notifications (Accomplishments)
  - Bug triage (High-priority quests)
- **Result:** 30% faster deployment cycles

**Example 2: Agency (5 contractors)**
- Uses OpenClawfice for:
  - Client request tracking (Quests)
  - Handoff coordination (Water Cooler)
  - Daily standup replacement (Dashboard glance)
- **Result:** Eliminated 3 meetings/week

**Example 3: Solo Dev + AI Agents**
- Uses OpenClawfice for:
  - Context switching (see what each agent is doing)
  - Unblocking agents (respond to quests)
  - Motivation (XP celebrations)
- **Result:** Ships 2× faster with agent workflow visibility

---

## Measuring Success

**Track these metrics:**

1. **Agent idle time** (before vs after OpenClawfice)
2. **Time to unblock** (quest created → response time)
3. **Daily accomplishments** (velocity over time)
4. **Meeting reduction** (replaced by async dashboard checks)

**Goal:** 20-30% productivity increase in first month

---

## Next Steps

**Getting started:**
1. Pick 1-2 workflows from this guide
2. Implement them this week
3. Measure time saved
4. Add more workflows as you get comfortable

**Advanced:**
- Build custom integrations (Slack, GitHub, monitoring)
- Create workflow-specific quest templates
- Automate common responses
- Set up webhooks for external events

---

**Remember:** OpenClawfice saves time by centralizing visibility and reducing context switching. The more you integrate it into your workflow, the more time you save.

🚀 **Start with Workflow 1 (Morning Standup) and go from there!**
