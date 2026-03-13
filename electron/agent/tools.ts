import { AgentKnowledgeAssembler } from './knowledge';
import { AgentMemoryStore } from './memory-store';

// Local tool union kept here to avoid importing renderer-side types into Electron build.
export type AgentToolName =
  | 'resume_get'
  | 'resume_search'
  | 'memory_lookup'
  | 'memory_save'
  | 'memory_summarize'
  | 'memory_clear';

export class AgentToolRegistry {
  constructor(
    private readonly knowledgeAssembler: AgentKnowledgeAssembler,
    private readonly memoryStore: AgentMemoryStore,
  ) {}

  getAllowedTools(): AgentToolName[] {
    return ['resume_get', 'resume_search', 'memory_lookup', 'memory_save', 'memory_summarize', 'memory_clear'];
  }

  async invoke(toolName: AgentToolName, input: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'resume_get':
        return this.knowledgeAssembler.buildResumeDoc();
      case 'resume_search':
        return this.knowledgeAssembler.searchResumeFacts(String(input.query || ''));
      case 'memory_lookup':
        return this.memoryStore.lookupMemory(String(input.sessionId || ''));
      case 'memory_save':
        return this.memoryStore.saveMemory(
          String(input.sessionId || ''),
          input.assistantId as any,
          String(input.content || ''),
          input.kind as any,
        );
      case 'memory_summarize':
        return this.memoryStore.summarizeMemory(String(input.sessionId || ''));
      case 'memory_clear':
        this.memoryStore.clearMemory(String(input.sessionId || ''));
        return { cleared: true };
      default:
        throw new Error(`Unsupported agent tool: ${toolName}`);
    }
  }
}

export function createAgentToolRegistry(
  knowledgeAssembler: AgentKnowledgeAssembler,
  memoryStore: AgentMemoryStore,
): AgentToolRegistry {
  return new AgentToolRegistry(knowledgeAssembler, memoryStore);
}
