# Feature: AI Assistant

**Status**: In Progress (UI complete, backend integration pending)  
**Last Updated**: 2026-02-14

## User Story

As a job seeker, I want AI-powered writing assistance so that I can improve my interview responses with features like summarization, rewriting, expansion, and brainstorming.

## Overview

The AI Assistant provides a chat-like interface for AI-powered writing tasks. Users select a capability (summarize, rewrite, expand, translate, brainstorm, outline), provide input text with optional context settings (tone, language, custom instructions), and receive AI-generated output. Task history is tracked for reference.

## Acceptance Criteria

- [x] Select from available AI capabilities
- [x] Input text for AI processing
- [x] Configure context: tone, language, custom instructions
- [x] View streaming AI output in real time
- [x] View task history with previous results
- [x] Cancel in-progress tasks
- [x] Loading and error states
- [x] Responsive layout
- [ ] Real LLM backend integration (currently simulated)
- [ ] Document context integration (use current doc as input)
- [ ] API key configuration UI
- [ ] Token usage tracking and limits
- [ ] Export AI output to document

## Key Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| AIAssistant | `src/components/AIAssistant.tsx` | Full AI assistant interface |

## Service Dependencies

- `IAgentService.getCapabilities()` — List available AI tasks
- `IAgentService.executeTask(request)` — Run an AI task
- `IAgentService.streamTask(request, callback)` — Stream AI output
- `IAgentService.getTaskHistory()` — Fetch previous tasks
- `IAgentService.getTask(id)` — Fetch single task result
- `IAgentService.cancelTask(id)` — Cancel running task

## Available Capabilities

| Capability | Description |
|------------|-------------|
| Summarize | Condense text to key points |
| Rewrite | Rephrase for clarity or tone |
| Expand | Add detail and depth |
| Translate | Convert to another language |
| Brainstorm | Generate ideas from a prompt |
| Outline | Create structured outline |

## Implementation Gap

The `IAgentService` interface is fully defined and both platform implementations exist, but they currently return **simulated responses**. Real integration requires:

1. **LLM Provider**: Connect to OpenAI, Anthropic, or local model via LangGraph
2. **API Key Management**: Secure storage (Electron keychain)
3. **Streaming Protocol**: Wire `streamTask()` to actual SSE or WebSocket stream
4. **Document Context**: Pass current document content as context to the LLM
5. **Rate Limiting**: Implement token counting and usage caps

## Success Metrics

- AI response latency: < 3 seconds for first token (streaming)
- Task completion rate: > 95%
- Output quality: User satisfaction > 4/5 (future survey)

## Design References

- See: `docs/FRONTEND.md` — Card patterns, gradient backgrounds
- See: `docs/SECURITY.md` — API key storage considerations
- See: `docs/ai-feature-summary/` — Original AI feature planning docs
