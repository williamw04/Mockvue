import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import type { AgentAssistantId, AgentSession, ContextSummary, MemoryEntry, MemoryEntryKind, AgentChatMessage, CreateAgentSessionInput } from '../internal-types';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface AgentMemorySnapshot {
  sessions: AgentSession[];
  memories: MemoryEntry[];
  summaries: ContextSummary[];
  messages: Record<string, AgentChatMessage[]>;
}

export class AgentMemoryStore {
  private readonly agentDataDir: string;
  private readonly snapshotFile: string;
  private sessions = new Map<string, AgentSession>();
  private memories = new Map<string, MemoryEntry[]>();
  private summaries = new Map<string, ContextSummary>();
  private messages = new Map<string, AgentChatMessage[]>();

  constructor() {
    const userDataPath = app.getPath('userData');
    this.agentDataDir = path.join(userDataPath, 'agent-data');
    this.snapshotFile = path.join(this.agentDataDir, 'memory.json');
    this.ensureDirectories();
    this.load();
  }

  createSession(input: CreateAgentSessionInput): AgentSession {
    const now = new Date().toISOString();
    const session: AgentSession = {
      id: makeId('agent-session'),
      assistantId: input.assistantId,
      title: input.title || 'Untitled Session',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      resumeAnalysisSnapshot: input.resumeAnalysisSnapshot,
      resumeSnapshot: input.resumeSnapshot,
      forkedFrom: input.forkFromSessionId,
    };
    this.sessions.set(session.id, session);
    this.memories.set(session.id, []);
    this.messages.set(session.id, []);
    this.save();
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
    this.save();
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
    this.save();
    return summary;
  }

  getSummary(sessionId: string): ContextSummary | null {
    return this.summaries.get(sessionId) || null;
  }

  clearMemory(sessionId: string): void {
    this.memories.set(sessionId, []);
    this.summaries.delete(sessionId);
    this.save();
  }

  getMessages(sessionId: string): AgentChatMessage[] {
    return this.messages.get(sessionId) || [];
  }

  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): AgentChatMessage {
    const now = new Date().toISOString();
    const message: AgentChatMessage = {
      id: makeId('msg'),
      role,
      content,
      timestamp: now,
    };
    const existing = this.messages.get(sessionId) || [];
    existing.push(message);
    this.messages.set(sessionId, existing);

    const session = this.sessions.get(sessionId);
    if (session) {
      session.messageCount = existing.length;
      session.updatedAt = now;
      session.lastTurnAt = now;

      if (role === 'assistant' && existing.length === 2 && existing[0].role === 'user') {
        session.title = this.generateTitleFromAssistantResponse(content);
      }

      this.sessions.set(sessionId, session);
    }

    this.save();
    return message;
  }

  renameSession(sessionId: string, newTitle: string): AgentSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.title = newTitle;
    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);
    this.save();
    return session;
  }

  deleteSession(sessionId: string): boolean {
    if (!this.sessions.has(sessionId)) return false;

    this.sessions.delete(sessionId);
    this.memories.delete(sessionId);
    this.summaries.delete(sessionId);
    this.messages.delete(sessionId);
    this.save();
    return true;
  }

  private generateTitleFromAssistantResponse(content: string): string {
    const firstLine = content.split('\n')[0].trim();
    let title = firstLine.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
    const maxLength = 50;
    if (title.length > maxLength) {
      title = title.substring(0, maxLength).trim() + '...';
    }
    return title || 'New Chat';
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.agentDataDir)) {
      fs.mkdirSync(this.agentDataDir, { recursive: true });
    }
  }

  private load(): void {
    if (!fs.existsSync(this.snapshotFile)) {
      return;
    }

    try {
      const raw = fs.readFileSync(this.snapshotFile, 'utf-8');
      const snapshot = JSON.parse(raw) as AgentMemorySnapshot;

      this.sessions = new Map(snapshot.sessions.map(session => [session.id, session]));
      
      this.memories = new Map<string, MemoryEntry[]>();
      for (const memory of snapshot.memories) {
        const existing = this.memories.get(memory.sessionId) || [];
        existing.push(memory);
        this.memories.set(memory.sessionId, existing);
      }
      
      this.summaries = new Map(snapshot.summaries.map(summary => [summary.sessionId, summary]));

      this.messages = new Map<string, AgentChatMessage[]>();
      if (snapshot.messages) {
        for (const [sessionId, msgs] of Object.entries(snapshot.messages)) {
          this.messages.set(sessionId, msgs);
        }
      }

      console.log('[AgentMemoryStore] Loaded from disk:', {
        sessions: this.sessions.size,
        memories: this.memories.size,
        messages: this.messages.size,
      });
    } catch (error) {
      console.error('[AgentMemoryStore] Failed to load:', error);
    }
  }

  private save(): void {
    const messagesRecord: Record<string, AgentChatMessage[]> = {};
    for (const [sessionId, msgs] of this.messages.entries()) {
      messagesRecord[sessionId] = msgs;
    }

    const snapshot: AgentMemorySnapshot = {
      sessions: Array.from(this.sessions.values()),
      memories: Array.from(this.memories.values()).flat(),
      summaries: Array.from(this.summaries.values()),
      messages: messagesRecord,
    };

    try {
      fs.writeFileSync(this.snapshotFile, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (error) {
      console.error('[AgentMemoryStore] Failed to save:', error);
    }
  }
}