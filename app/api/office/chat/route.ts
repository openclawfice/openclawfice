import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const CHAT_FILE = join(STATUS_DIR, 'chat.json');
const ACCOMPLISHMENTS_FILE = join(STATUS_DIR, 'accomplishments.json');
const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(homedir(), '.openclaw', 'openclawfice.config.json'),
];

function ensureStatusDir() {
  try {
    if (!existsSync(STATUS_DIR)) mkdirSync(STATUS_DIR, { recursive: true });
  } catch {}
}

function readChat(): any[] {
  try {
    if (existsSync(CHAT_FILE)) {
      return JSON.parse(readFileSync(CHAT_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function readOfficeConfig(): any {
  for (const path of CONFIG_PATHS) {
    if (existsSync(path)) {
      try {
        return JSON.parse(readFileSync(path, 'utf-8'));
      } catch {}
    }
  }
  return {};
}

function readAccomplishments(): any[] {
  try {
    if (existsSync(ACCOMPLISHMENTS_FILE)) {
      return JSON.parse(readFileSync(ACCOMPLISHMENTS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

interface AgentContext {
  task?: string;
  status?: string;
  lastAccomplishment?: { title: string; detail?: string; timestamp: number };
}

interface ChatMsg {
  from: string;
  text: string;
  ts: number;
}

interface ChatInput {
  agentNames: string[];
  allAgents: { name: string; status: string; task?: string }[];
  contexts: Record<string, AgentContext>;
  recentChat: ChatMsg[];
}

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const pickFrom = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function isQuestion(text: string): boolean {
  return text.includes('?') || /\b(should|could|can|does|how|what|where|who|anyone|need)\b/i.test(text);
}

function mentionsAgent(text: string, name: string): boolean {
  return text.toLowerCase().includes(name.toLowerCase());
}

/**
 * Generate a conversational reply. The core principle: if someone just said
 * something, the next message should be a direct response to it — not a
 * random unrelated statement.
 */
function generateChatMessage(
  input: ChatInput,
  mission?: { goal?: string; priorities?: string[] },
): ChatMsg | null {
  const { agentNames, allAgents, contexts, recentChat } = input;
  if (agentNames.length === 0) return null;

  const last = recentChat[recentChat.length - 1];
  const secondLast = recentChat[recentChat.length - 2];
  const recentTexts = new Set(recentChat.slice(-6).map(m => m.text));

  // Pick who speaks next — prefer someone other than the last speaker,
  // and if someone was mentioned/asked, they should reply
  let from: string;
  const othersFromLast = agentNames.filter(n => n !== last?.from);
  if (last) {
    const mentioned = agentNames.find(n => n !== last.from && mentionsAgent(last.text, n));
    if (mentioned) {
      from = mentioned;
    } else if (othersFromLast.length > 0) {
      from = pick(othersFromLast);
    } else {
      from = pick(agentNames);
    }
  } else {
    from = pick(agentNames);
  }

  const ctx = contexts[from] || {};
  const pool: string[] = [];

  // ── REPLY TO LAST MESSAGE ───────────────────────────────────────────
  if (last) {
    const lastIsUser = !agentNames.includes(last.from);
    const lastCtx = contexts[last.from] || {};

    // If the user posted a message, always respond to it directly
    if (lastIsUser) {
      pool.push(
        `@${last.from} On it — let me look into that`,
        `@${last.from} Good point. I'll factor that into what I'm working on`,
        `@${last.from} Noted. ${ctx.task ? `I'm currently on ${ctx.task} but I can pivot if needed` : `I can pick that up`}`,
        `@${last.from} Makes sense. Anyone else have thoughts on this?`,
      );
      if (isQuestion(last.text)) {
        pool.push(
          `@${last.from} Let me check and get back to you on that`,
          `@${last.from} ${ctx.task ? `From what I've seen working on ${ctx.task} — ` : ''}I think we should discuss that`,
        );
      }
    }

    // Reply to a question from another agent
    if (isQuestion(last.text) && !lastIsUser) {
      if (last.text.toLowerCase().includes('help') || last.text.toLowerCase().includes('hand')) {
        pool.push(
          `${last.from}, ${ctx.task ? `I'm wrapping up ${ctx.task}, can help after` : `yeah I'm free — what do you need?`}`,
          `I can take something on. What's the bottleneck?`,
        );
      }
      if (last.text.toLowerCase().includes('block')) {
        pool.push(
          `No blockers on my end. ${ctx.task ? `${ctx.task} is moving along` : 'Ready for a new task'}`,
          `Nothing blocking me, but we should check if ${pick(othersFromLast.length > 0 ? othersFromLast : agentNames)} needs anything`,
        );
      }
      if (last.text.toLowerCase().includes('priority') || last.text.toLowerCase().includes('prioritize')) {
        if (mission?.priorities?.length) {
          const p = pick(mission.priorities);
          pool.push(
            `I'd say "${p}" — that feels like the biggest gap right now`,
            `From what I can tell, "${p}" would move the needle the most`,
          );
        }
        pool.push(
          `${ctx.task ? `I think finishing ${ctx.task} first makes sense, then we can reassess` : 'Let me check what has the most impact'}`,
        );
      }
      if (last.text.toLowerCase().includes('how') && last.text.toLowerCase().includes('going')) {
        pool.push(
          `${ctx.task ? `${ctx.task} — making progress. Should have something to show soon` : 'Looking for the next thing to pick up'}`,
          `Going well. ${ctx.lastAccomplishment ? `Just finished ${ctx.lastAccomplishment.title}` : 'Steady progress'}`,
        );
      }
      // Generic question reply
      if (pool.length < 3) {
        pool.push(
          `Good question. ${ctx.task ? `From my work on ${ctx.task}, I think` : 'I think'} we should figure that out`,
          `Let me think on that — ${last.from}, what's your take?`,
        );
      }
    }

    // Reply to a status update (someone said what they're working on)
    if (!isQuestion(last.text) && !lastIsUser) {
      if (lastCtx.task && last.text.toLowerCase().includes(lastCtx.task.toLowerCase().slice(0, 20))) {
        pool.push(
          `Nice, ${last.from}. ${ctx.task ? `I'm working on ${ctx.task} — might connect to what you're doing` : 'Let me know if you need a hand'}`,
          `That's solid progress ${last.from}. Does that unblock anything else?`,
        );
      }
      if (last.text.toLowerCase().includes('finished') || last.text.toLowerCase().includes('shipped') || last.text.toLowerCase().includes('done')) {
        pool.push(
          `Great work ${last.from}. What's next for you?`,
          `Nice one. Should we reprioritize now that that's done?`,
          `${last.from}, is there a follow-up task or are you free to help elsewhere?`,
        );
      }
    }

    // Continue a thread — if the last 2 messages are between 2 people,
    // a third person can chime in
    if (secondLast && secondLast.from !== last.from && from !== last.from && from !== secondLast.from) {
      pool.push(
        `Jumping in — ${ctx.task ? `from my work on ${ctx.task}, ` : ''}I think that's the right call`,
        `Agree with ${last.from} on this. We should move forward`,
      );
    }
  }

  // ── CONVERSATION STARTERS (only when no recent context to reply to) ─
  if (pool.length === 0) {
    if (ctx.task) {
      pool.push(
        `Update: ${ctx.task} is progressing. Hit a tricky spot but working through it`,
        `Quick question for the team — anyone dealt with something like ${ctx.task} before?`,
      );
    }
    if (ctx.lastAccomplishment && (Date.now() - ctx.lastAccomplishment.timestamp) < 7200000) {
      pool.push(
        `Just finished ${ctx.lastAccomplishment.title}. What should I pick up next?`,
        `Done with ${ctx.lastAccomplishment.title} — anyone need help before I grab the next thing?`,
      );
    }

    const working = allAgents.filter(a => a.status === 'working' && a.name !== from);
    const idle = allAgents.filter(a => a.status === 'idle' && a.name !== from);

    if (working.length > 0) {
      const w = pickFrom(working);
      if (w.task) {
        pool.push(`${w.name}, how's ${w.task} going? Need any help?`);
      }
    }

    if (idle.length > 0 && working.length === 0) {
      pool.push(
        `Looks like we're all between tasks. What should we prioritize next?`,
        `Nobody has an active task — what's the highest impact thing we should jump on?`,
      );
    }

    if (mission?.priorities?.length) {
      const p = pick(mission.priorities);
      pool.push(
        `Where are we on "${p}"? Anyone making progress there?`,
        `Should someone pick up "${p}"? Feels like it needs attention`,
      );
    }

    // Bare minimum fallback
    if (pool.length === 0) {
      if (mission?.goal) {
        pool.push(`Thinking about "${mission.goal}" — where's the biggest gap right now?`);
      }
      pool.push(`What's everyone working on? Let's sync up`);
    }
  }

  // Deduplicate against recent messages
  const fresh = pool.filter(m => !recentTexts.has(m));
  const finalPool = fresh.length > 0 ? fresh : pool;

  return {
    from,
    text: pick(finalPool),
    ts: Date.now(),
  };
}

export async function GET() {
  return NextResponse.json(readChat());
}

export async function POST(request: Request) {
  ensureStatusDir();

  try {
    const body = await request.json();
    const config = readOfficeConfig();
    const waterCoolerConfig = config.waterCooler || {};

    // Allow adding a user message to the chat
    if (body.type === 'user_message' && body.from && body.text) {
      const chat = readChat();
      chat.push({ from: body.from, text: body.text, ts: Date.now() });
      const maxMessages = waterCoolerConfig.maxMessages || 50;
      writeFileSync(CHAT_FILE, JSON.stringify(chat.slice(-maxMessages), null, 2));
      return NextResponse.json({ success: true });
    }

    if (waterCoolerConfig.enabled === false) {
      return NextResponse.json({ success: false, error: 'Water cooler disabled' });
    }

    const chat = readChat();
    const agentNames: string[] = body.agentNames || [];
    const rawContexts: Record<string, { task?: string; status?: string }> = body.contexts || {};
    const allAgents: { name: string; status: string; task?: string }[] = body.allAgents || [];

    // Enrich contexts with recent accomplishments
    const accomplishments = readAccomplishments();
    const enriched: Record<string, AgentContext> = {};
    for (const [name, ctx] of Object.entries(rawContexts)) {
      const agentAccs = accomplishments
        .filter(a => a.who === name)
        .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
      enriched[name] = {
        ...ctx,
        lastAccomplishment: agentAccs[0]
          ? { title: agentAccs[0].title, detail: agentAccs[0].detail, timestamp: agentAccs[0].timestamp }
          : undefined,
      };
    }

    const newMessage = generateChatMessage(
      {
        agentNames,
        allAgents,
        contexts: enriched,
        recentChat: chat.slice(-10),
      },
      config.mission,
    );

    if (newMessage) {
      chat.push(newMessage);
      const maxMessages = waterCoolerConfig.maxMessages || 50;
      const trimmed = chat.slice(-maxMessages);
      writeFileSync(CHAT_FILE, JSON.stringify(trimmed, null, 2));
      return NextResponse.json({ success: true, message: newMessage });
    }

    return NextResponse.json({ success: false, error: 'No agents available' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate chat' }, { status: 500 });
  }
}
