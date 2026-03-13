import type { AgentAssistantId, AgentSession, ContextSummary, MemoryEntry, MemoryEntryKind } from '../internal-types';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class AgentMemoryStore {
  private sessions = new Map<string, AgentSession>();
  private memories = new Map<string, MemoryEntry[]>();
  private summaries = new Map<string, ContextSummary>();

  createSession(assistantId: AgentAssistantId, title?: string): AgentSession {
    const now = new Date().toISOString();
    const session: AgentSession = {
      id: makeId('agent-session'),
      assistantId,
      title: title || 'Untitled Session',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(session.id, session);
    this.memories.set(session.id, []);
    return session;
  }

  getSession(sessionId: string): AgentSession | null {
    return this.sessions.get(sessionId) || null;
  }

  listSessions(assistantId?: AgentAssistantId): AgentSession[] {
    const sessions = Array.from(this.sessions.values());
    if (!assistantId) return sessions;
    return sessions.filter(session => session.assistantId === assistantId);
  }

  lookupMemory(sessionId: string): MemoryEntry[] {
    return this.memories.get(sessionId) || [];
  }

  saveMemory(sessionId: string, assistantId: AgentAssistantId, content: string, kind: MemoryEntryKind = 'fact'): MemoryEntry {
    const now = new Date().toISOString();
    const entry: MemoryEntry = {
      id: makeId('memory'),
      sessionId,
      assistantId,
      content,
      kind,
      createdAt: now,
      updatedAt: now,
    };
    const existing = this.memories.get(sessionId) || [];
    existing.push(entry);
    this.memories.set(sessionId, existing);
    return entry;
  }

  summarizeMemory(sessionId: string): ContextSummary {
    const memory = this.lookupMemory(sessionId);
    const summary: ContextSummary = {
      sessionId,
      summary: memory.length > 0 ? `Stored ${memory.length} memory entries.` : 'No memory stored.',
      updatedAt: new Date().toISOString(),
    };
    this.summaries.set(sessionId, summary);
    return summary;
  }

  getSummary(sessionId: string): ContextSummary | null {
    return this.summaries.get(sessionId) || null;
  }

  clearMemory(sessionId: string): void {
    this.memories.set(sessionId, []);
    this.summaries.delete(sessionId);
  }
}
