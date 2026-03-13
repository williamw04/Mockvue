import type { AgentAssistantId } from '../internal-types';

export interface AssistantPromptConfig {
  assistantId: AgentAssistantId;
  title: string;
  systemPrompt: string;
}

export function getAssistantPromptConfig(assistantId: AgentAssistantId): AssistantPromptConfig {
  if (assistantId === 'behavioral-assistant') {
    return {
      assistantId,
      title: 'Behavioral Assistant',
      systemPrompt: 'You are a behavioral interview assistant. Use retrieved evidence and assistant memory only.',
    };
  }

  return {
    assistantId,
    title: 'Resume Assistant',
    systemPrompt: 'You are a resume information assistant. Use retrieved evidence and assistant memory only.',
  };
}

export function buildSystemPrompt(assistantId: AgentAssistantId): string {
  return getAssistantPromptConfig(assistantId).systemPrompt;
}
