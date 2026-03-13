import type { AgentAssistantId, AgentTurnInput, AgentTurnResult, CreateAgentSessionInput } from '../internal-types';
import { AgentKnowledgeAssembler } from './knowledge';
import { AgentMemoryStore } from './memory-store';
import { AgentModelClient } from './model';
import { buildSystemPrompt } from './prompts';
import { AgentToolRegistry, createAgentToolRegistry } from './tools';

export class AgentRuntime {
  private readonly memoryStore: AgentMemoryStore;
  private readonly toolRegistry: AgentToolRegistry;
  private readonly modelClient: AgentModelClient;

  constructor(knowledgeAssembler: AgentKnowledgeAssembler, memoryStore?: AgentMemoryStore, modelClient?: AgentModelClient) {
    this.memoryStore = memoryStore || new AgentMemoryStore();
    this.toolRegistry = createAgentToolRegistry(knowledgeAssembler, this.memoryStore);
    this.modelClient = modelClient || new AgentModelClient();
  }

  createSession(input: CreateAgentSessionInput) {
    return this.memoryStore.createSession(input.assistantId, input.title);
  }

  getSession(sessionId: string) {
    return this.memoryStore.getSession(sessionId);
  }

  listSessions(assistantId?: AgentAssistantId) {
    return this.memoryStore.listSessions(assistantId);
  }

  async runTurn(input: AgentTurnInput): Promise<AgentTurnResult> {
    const session = this.memoryStore.getSession(input.sessionId);
    if (!session) {
      throw new Error(`Assistant session not found: ${input.sessionId}`);
    }

    const facts = await this.toolRegistry.invoke('resume_search', { query: input.message });
    const reply = await this.modelClient.completeTurn(buildSystemPrompt(session.assistantId), input.message);

    if (input.includeMemory) {
      this.memoryStore.saveMemory(session.id, session.assistantId, input.message, 'fact');
    }

    return {
      session: {
        ...session,
        updatedAt: new Date().toISOString(),
        lastTurnAt: new Date().toISOString(),
      },
      reply,
      evidence: Array.isArray(facts)
        ? facts.slice(0, 3).map((fact: any) => ({
            source: fact.kind,
            sourceId: fact.sourceId,
            label: fact.text,
            snippet: fact.text,
          }))
        : [],
      memoryUpdated: Boolean(input.includeMemory),
    };
  }

  clearSessionMemory(sessionId: string): void {
    this.memoryStore.clearMemory(sessionId);
  }
}
