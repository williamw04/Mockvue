/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AgentAssistantId, AgentTurnInput, AgentTurnResult, CreateAgentSessionInput, AgentChatMessage, AgentSession } from '../internal-types';
import { AgentKnowledgeAssembler } from './knowledge';
import { AgentMemoryStore } from './memory-store';
import { AgentModelClient, StreamingCallbacks } from './model';
import { AgentToolExecutor } from './tools';

export type { StreamingCallbacks } from './model';

export class AgentRuntime {
  private readonly memoryStore: AgentMemoryStore;
  private readonly modelClient: AgentModelClient;
  private readonly knowledgeAssembler: AgentKnowledgeAssembler;
  private readonly coachingStore: any | null;

  constructor(knowledgeAssembler: AgentKnowledgeAssembler, memoryStore?: AgentMemoryStore, modelClient?: AgentModelClient, coachingStore?: any) {
    this.knowledgeAssembler = knowledgeAssembler;
    this.memoryStore = memoryStore || new AgentMemoryStore();
    this.modelClient = modelClient || new AgentModelClient();
    this.coachingStore = coachingStore ?? null;
  }

  createSession(input: CreateAgentSessionInput) {
    return this.memoryStore.createSession(input);
  }

  getSession(sessionId: string) {
    return this.memoryStore.getSession(sessionId);
  }

  listSessions(assistantId?: AgentAssistantId) {
    return this.memoryStore.listSessions(assistantId);
  }

  getMessages(sessionId: string): AgentChatMessage[] {
    return this.memoryStore.getMessages(sessionId);
  }

  setApiKey(apiKey: string): void {
    this.modelClient.setApiKey(apiKey);
  }

  async runTurn(input: AgentTurnInput, callbacks?: StreamingCallbacks): Promise<AgentTurnResult> {
    const session = this.memoryStore.getSession(input.sessionId);
    if (!session) {
      throw new Error(`Assistant session not found: ${input.sessionId}`);
    }

    console.log('\n[AgentRuntime] ========== TURN START ==========');
    console.log('[AgentRuntime] Session:', session.id, 'Assistant:', session.assistantId);
    console.log('[AgentRuntime] User message:', input.message);

    this.memoryStore.addMessage(session.id, 'user', input.message);

    const toolExecutor = new AgentToolExecutor(
      this.knowledgeAssembler['userDataStorage'],
      {
        lookupMemory: (sessionId) => this.memoryStore.lookupMemory(sessionId),
        saveMemory: (sessionId, assistantId, content, kind) => 
          this.memoryStore.saveMemory(sessionId, assistantId, content, kind as any),
        clearMemory: (sessionId) => this.memoryStore.clearMemory(sessionId),
      },
      session.id,
      session.assistantId,
      this.coachingStore,
    );

    const messages = this.memoryStore.getMessages(session.id);
    const { reply, trace } = await this.modelClient.completeTurnWithTools(
      session.assistantId,
      messages,
      toolExecutor,
      callbacks,
    );

    this.memoryStore.addMessage(session.id, 'assistant', reply);

    if (input.includeMemory) {
      this.memoryStore.saveMemory(session.id, session.assistantId, input.message, 'fact');
    }

    this.memoryStore.summarizeMemory(session.id);

    const updatedSession = this.memoryStore.getSession(session.id)!;

    const evidence = trace.steps
      .filter(s => s.kind === 'tool_result' && s.toolResult)
      .flatMap(s => {
        const result = s.toolResult as any;
        if (Array.isArray(result)) {
          return result.slice(0, 3).map((r: any) => ({
            source: r.kind || s.toolName || 'unknown',
            sourceId: r.id || r.sourceId || 'unknown',
            label: r.text || r.originalBullet || r.title || JSON.stringify(r).slice(0, 50),
            snippet: r.text || r.originalBullet || '',
          }));
        }
        return [];
      })
      .slice(0, 5);

    console.log('[AgentRuntime] Turn complete. Message count:', updatedSession.messageCount);
    console.log('[AgentRuntime] Tool calls in trace:', trace.totalToolCalls);
    console.log('[AgentRuntime] ========== TURN END ==========\n');

    return {
      session: updatedSession,
      reply,
      evidence,
      memoryUpdated: Boolean(input.includeMemory),
      trace,
    };
  }

  clearSessionMemory(sessionId: string): void {
    this.memoryStore.clearMemory(sessionId);
  }

  renameSession(sessionId: string, newTitle: string): AgentSession | null {
    return this.memoryStore.renameSession(sessionId, newTitle);
  }

  deleteSession(sessionId: string): boolean {
    return this.memoryStore.deleteSession(sessionId);
  }
}