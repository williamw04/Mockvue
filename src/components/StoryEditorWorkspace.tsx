import { useState, useRef, useEffect, useCallback } from 'react';
import { useAgent } from '../services';
import type { AgentSession, CoreStoryCategory, CoreStoryMatch, Story } from '../types';
import { Loader2, Send, ArrowLeft, Sparkles } from 'lucide-react';

type EditorTab = 'free' | 'star';

function hasMetrics(text: string): boolean {
  return /\d/.test(text);
}

/** Best-effort parse of coach replies that use SITUATION/TASK/ACTION/RESULT labels. */
function parseStarFromAssistantReply(text: string): {
  situation: string;
  task: string;
  action: string;
  result: string;
} | null {
  const norm = text.replace(/\r\n/g, '\n');
  const pick = (label: string, nextLabels: string[]): string | null => {
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nextAlt = nextLabels.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const re = new RegExp(
      `(?:^|\\n)\\s*(?:\\*\\*)?\\s*${esc}\\s*(?:\\*\\*)?\\s*:?\\s*\\n?([\\s\\S]*?)(?=\\n\\s*(?:\\*\\*)?\\s*(?:${nextAlt})\\s*(?:\\*\\*)?\\s*:|$)`,
      'i'
    );
    const m = norm.match(re);
    return m ? m[1].trim() : null;
  };

  const situation =
    pick('SITUATION', ['TASK', 'ACTION', 'RESULT']) ||
    pick('S', ['T', 'TASK', 'A', 'ACTION', 'R', 'RESULT']);
  const task =
    pick('TASK', ['ACTION', 'RESULT']) || pick('T', ['A', 'ACTION', 'R', 'RESULT', 'SITUATION']);
  const action = pick('ACTION', ['RESULT']) || pick('A', ['R', 'RESULT', 'SITUATION', 'TASK']);
  const result = pick('RESULT', []) || pick('R', []);

  if (situation && task && action && result) {
    return { situation, task, action, result };
  }

  // Single-line variants: SITUATION: ... TASK: ...
  const oneLine = norm.match(
    /SITUATION\s*:\s*(.+?)\s+TASK\s*:\s*(.+?)\s+ACTION\s*:\s*(.+?)\s+RESULT\s*:\s*(.+)/i
  );
  if (oneLine) {
    return {
      situation: oneLine[1].trim(),
      task: oneLine[2].trim(),
      action: oneLine[3].trim(),
      result: oneLine[4].trim(),
    };
  }

  return null;
}

type StoryMeta = {
  category: CoreStoryCategory;
  name: string;
  icon: string;
  description: string;
  target: number;
};

interface StoryEditorWorkspaceProps {
  meta: StoryMeta;
  editForm: Partial<Story>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Story>>>;
  aiMatch: CoreStoryMatch | null;
  onSave: () => void;
  onCancel: () => void;
}

export function StoryEditorWorkspace({
  meta,
  editForm,
  setEditForm,
  aiMatch,
  onSave,
  onCancel,
}: StoryEditorWorkspaceProps) {
  const [tab, setTab] = useState<EditorTab>(() => {
    const filled = [editForm.situation, editForm.task, editForm.action, editForm.result]
      .map((s) => (s || '').trim().length)
      .reduce((a, b) => a + b, 0);
    return filled > 24 ? 'star' : 'free';
  });
  const [rawNotes, setRawNotes] = useState('');
  const agentService = useAgent();
  const envApiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  const [session, setSession] = useState<AgentSession | null>(null);
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>
  >([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [structuring, setStructuring] = useState(false);
  const [structureHint, setStructureHint] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (envApiKey) {
      agentService.setAgentApiKey(envApiKey);
    }
  }, [envApiKey, agentService]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ensureSession = useCallback(async () => {
    if (session) return session;
    if (!envApiKey) return null;
    const initialContext = [
      `Story category: ${meta.name} (${meta.category})`,
      meta.description,
      aiMatch
        ? `Resume match suggestion: ${aiMatch.relatedExperienceId}. Reasoning: ${aiMatch.reasoning}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');
    const s = await agentService.createAssistantSession({
      assistantId: 'behavioral-assistant',
      title: `Story · ${meta.name}`,
      initialContext,
    });
    setSession(s);
    return s;
  }, [session, envApiKey, agentService, meta, aiMatch]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (!envApiKey) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Add a Gemini API key (VITE_GEMINI_API_KEY) to use the coach here. You can still edit STAR fields manually.',
            timestamp: new Date().toISOString(),
          },
        ]);
        return;
      }

      const userMsg = {
        role: 'user' as const,
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setSending(true);
      try {
        const sess = await ensureSession();
        if (!sess) return;
        const result = await agentService.runAssistantTurn({
          sessionId: sess.id,
          message: trimmed,
          includeMemory: true,
        });
        setSession(result.session);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: result.reply,
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Something went wrong: ${e instanceof Error ? e.message : 'Unknown error'}`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setSending(false);
        inputRef.current?.focus();
      }
    },
    [envApiKey, agentService, ensureSession]
  );

  const handleStructureFromFreeWrite = useCallback(async () => {
    const raw = rawNotes.trim();
    if (raw.length < 20) {
      setStructureHint('Write at least a few sentences in free write first.');
      return;
    }
    setStructureHint(null);
    if (!envApiKey) {
      setStructureHint('Add VITE_GEMINI_API_KEY to run AI structuring.');
      return;
    }

    const prompt = `The candidate wrote this rough behavioral story for the "${meta.name}" interview category.

"""${raw}"""

Reply with exactly four sections using these headers and colons (each section can be multiple sentences):

SITUATION:
TASK:
ACTION:
RESULT:

Rules:
- Use first person ("I") in ACTION where possible.
- RESULT must include at least one concrete number, percent, dollar amount, or timeframe if the source text allows; if not infer a placeholder like "X%" only if the narrative clearly implies a metric.
- Do not add preamble or markdown outside these four labeled sections.`;

    setStructuring(true);
    try {
      const sess = await ensureSession();
      if (!sess) return;
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: '(Structured draft request from free write)',
          timestamp: new Date().toISOString(),
        },
      ]);
      const result = await agentService.runAssistantTurn({
        sessionId: sess.id,
        message: prompt,
        includeMemory: false,
      });
      setSession(result.session);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.reply,
          timestamp: new Date().toISOString(),
        },
      ]);

      const parsed = parseStarFromAssistantReply(result.reply);
      if (parsed) {
        setEditForm((prev) => ({
          ...prev,
          situation: parsed.situation,
          task: parsed.task,
          action: parsed.action,
          result: parsed.result,
        }));
        setTab('star');
        setStructureHint('STAR fields updated from the coach reply — review and save when ready.');
      } else {
        setStructureHint(
          'Coach replied but STAR labels were not detected. Check the assistant message and copy fields manually, or try again.'
        );
      }
    } catch (e) {
      setStructureHint(e instanceof Error ? e.message : 'Structuring failed.');
    } finally {
      setStructuring(false);
    }
  }, [rawNotes, envApiKey, meta.name, agentService, ensureSession, setEditForm]);

  const wordCount = rawNotes.split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex-1 pt-14 flex flex-col min-h-0 overflow-hidden bg-bg text-ink">
      <header className="flex-shrink-0 border-b border-rule bg-card px-6 py-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-[13px] text-ink-2 hover:text-ink border border-rule bg-transparent px-3 py-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to library
        </button>
        <div className="h-6 w-px bg-rule hidden sm:block" />
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] tracking-[0.15em] text-ink-3 uppercase">
            Story editor
          </div>
          <h1 className="font-serif text-[22px] font-medium tracking-tight m-0 truncate">
            <span className="text-ink-3 mr-2">{meta.icon}</span>
            {meta.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-transparent text-ink-3 border border-rule px-4 py-2 text-[13px] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!editForm.title?.trim()}
            className="bg-accent-hi text-white border-none px-5 py-2 text-[13px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save to Story Bank
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
        <main className="min-h-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-rule px-6 py-6">
          {aiMatch && (
            <div className="mb-6 bg-accent-lo border-l-[3px] border-accent-hi px-4 py-3">
              <div className="font-mono text-[10px] text-accent-hi font-semibold uppercase tracking-[0.12em] mb-1">
                AI recommended match
              </div>
              <div className="text-[13px] font-medium text-ink mb-1">
                {aiMatch.relatedExperienceId}
              </div>
              <p className="text-[12px] text-ink-2 leading-relaxed m-0">{aiMatch.reasoning}</p>
            </div>
          )}

          <div className="flex gap-1 p-1 bg-bg border border-rule w-fit mb-5">
            {(
              [
                ['free', 'Free write'],
                ['star', 'STAR outline'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`px-4 py-2 text-[12px] font-medium cursor-pointer border-none font-sans ${
                  tab === id ? 'bg-card text-ink shadow-sm' : 'bg-transparent text-ink-3'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'free' && (
            <div>
              <p className="text-[14px] text-ink-2 leading-relaxed m-0 mb-3 max-w-[640px]">
                Dump what happened in plain language — messy is fine. When you are ready, use{' '}
                <strong className="text-ink">Structure into STAR</strong> so the coach turns it into
                labeled sections you can refine on the STAR tab.
              </p>
              <div className="relative mb-3">
                <textarea
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder="e.g. what was at stake, who was involved, what you did, and what changed (numbers if you remember them)…"
                  className="w-full min-h-[220px] px-4 py-3 text-[14px] leading-relaxed border border-rule bg-card text-ink outline-none focus:border-accent-hi resize-y box-border"
                />
                <div className="absolute bottom-2 right-3 font-mono text-[10px] text-ink-3">
                  {wordCount} words
                </div>
              </div>
              {structureHint && (
                <div className="mb-3 text-[12px] text-accent-hi font-mono leading-snug">
                  {structureHint}
                </div>
              )}
              <button
                type="button"
                onClick={handleStructureFromFreeWrite}
                disabled={structuring || rawNotes.trim().length < 20}
                className="inline-flex items-center gap-2 bg-ink text-white border-none px-5 py-2.5 text-[13px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-default"
              >
                {structuring ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Structure into STAR
              </button>
              <p className="mt-2 text-[12px] text-ink-3 m-0">
                Sends your free write to the behavioral coach (right panel). STAR fields update
                automatically when the reply parses cleanly.
              </p>
            </div>
          )}

          {tab === 'star' && (
            <div className="max-w-[720px]">
              <p className="text-[14px] text-ink-2 leading-relaxed m-0 mb-5">
                Edit each part of STAR. Add a measurable result where you can.
              </p>
              <div className="mb-5">
                <div className="font-mono text-[10px] tracking-[0.15em] text-ink-3 uppercase mb-1.5">
                  Story title
                </div>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-rule bg-card outline-none text-ink font-serif text-[15px] font-medium focus:border-accent-hi"
                  placeholder="Give it a memorable name"
                />
              </div>

              {(
                [
                  {
                    key: 'situation' as const,
                    label: 'Situation',
                    hint: 'Set the scene. What was broken, unclear, or at risk?',
                  },
                  {
                    key: 'task' as const,
                    label: 'Task',
                    hint: 'What were you specifically responsible for solving?',
                  },
                  {
                    key: 'action' as const,
                    label: 'Action',
                    hint: 'What did YOU do? Be specific. Use "I" not "we".',
                  },
                  {
                    key: 'result' as const,
                    label: 'Result',
                    hint: 'What changed? A number makes this land.',
                  },
                ] as const
              ).map((field) => (
                <div key={field.key} className="mb-5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-mono text-[13px] text-accent-hi font-bold w-5">
                      {field.key === 'situation'
                        ? 'S'
                        : field.key === 'task'
                          ? 'T'
                          : field.key === 'action'
                            ? 'A'
                            : 'R'}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.15em] text-ink-3 uppercase">
                      {field.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-3 italic m-0 mb-1">{field.hint}</p>
                  <textarea
                    value={(editForm[field.key] as string) || ''}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className={`w-full px-3 py-3 text-[13px] leading-relaxed border outline-none resize-y min-h-[80px] box-border ${
                      field.key === 'result' && editForm.result && !hasMetrics(editForm.result)
                        ? 'border-accent-hi bg-accent-lo'
                        : 'border-rule bg-card'
                    }`}
                  />
                  {field.key === 'result' && editForm.result && !hasMetrics(editForm.result) && (
                    <div className="font-mono text-[11px] text-accent-hi mt-1 tracking-[0.05em]">
                      No number detected — try adding a %, $, or timeframe.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <aside className="min-h-[280px] lg:min-h-0 flex flex-col bg-card overflow-hidden">
          <div className="flex-shrink-0 px-4 py-3 border-b border-rule">
            <div className="font-mono text-[10px] tracking-[0.15em] text-ink-3 uppercase">
              Behavioral coach
            </div>
            <p className="text-[12px] text-ink-2 m-0 mt-1 leading-snug">
              Ask for feedback, sharper wording, or follow-up questions interviewers might ask.
            </p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-[12px] text-ink-3 leading-relaxed space-y-2">
                <p className="m-0">Try one of these to start:</p>
                <ul className="m-0 pl-4 list-disc space-y-1">
                  <li>Is my Result specific enough for {meta.name}?</li>
                  <li>How can I make the Action sound more like my contribution?</li>
                  <li>What follow-up questions should I prepare for?</li>
                </ul>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-[13px] leading-relaxed rounded-md px-3 py-2 ${
                  m.role === 'user'
                    ? 'bg-bg text-ink ml-4'
                    : 'bg-accent-lo text-ink mr-2 border border-rule'
                }`}
              >
                <div className="font-mono text-[9px] text-ink-3 uppercase mb-1">{m.role}</div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-[12px] text-ink-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex-shrink-0 p-3 border-t border-rule flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage(input);
                }
              }}
              placeholder={envApiKey ? 'Message the coach…' : 'API key required for chat'}
              rows={2}
              disabled={sending}
              className="flex-1 min-w-0 px-3 py-2 text-[13px] border border-rule bg-bg outline-none focus:border-accent-hi resize-none disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => void sendMessage(input)}
              disabled={sending || !input.trim()}
              className="self-end flex-shrink-0 w-10 h-10 flex items-center justify-center bg-accent-hi text-white border-none cursor-pointer disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
