# Feature: Resume Assistant

**Status**: In Progress  
**Last Updated**: 2026-03-20

## User Story

As a job seeker, I want a conversational AI assistant that helps me improve my resume with persistent sessions and responsive controls, so I can iteratively refine my resume content and manage my coaching conversations effectively.

## Overview

The Resume Assistant is a chat-based interface powered by the Agent Foundation (`docs/product-specs/agent-foundation.md`). It provides contextual coaching based on resume analysis, with full session management, real-time streaming, and conversation controls.

This spec covers the **UI/UX layer** for the assistant, including session management, streaming, and interaction controls. For the underlying agent architecture, see `agent-foundation.md`.

## Acceptance Criteria

### Session Management

- [ ] User can view list of past chat sessions
- [ ] User can rename a session with a custom title
- [ ] User can delete a session (with confirmation)
- [ ] User can duplicate a session to branch a conversation
- [ ] Sessions persist across app restarts
- [ ] Active session is remembered on return visits

### Streaming Responses

- [ ] AI responses stream in real-time (token-by-token or chunked)
- [ ] Streaming provides visual feedback during generation
- [ ] Streaming handles network interruptions gracefully
- [ ] Partial responses are preserved if stream is interrupted

### Stop Generating

- [ ] "Stop generating" button appears during active streaming
- [ ] Clicking stop immediately halts the stream
- [ ] Partial response is preserved in the chat after stopping
- [ ] User can send a new message after stopping

### Undo Functionality

- [ ] User can undo their last message (removes user message + AI response)
- [ ] Undo restores conversation to previous state
- [ ] Multiple undo levels supported (configurable depth)
- [ ] Undo is available via keyboard shortcut (Cmd/Ctrl+Z) or UI button

### Tool Call Timeline Visibility

- [ ] Tool calls are visible in the chat timeline
- [ ] Each tool call shows: tool name, status (running/success/error), duration
- [ ] Tool call results can be expanded/collapsed
- [ ] Tool call errors are clearly indicated
- [ ] Tool calls are visually distinct from regular messages

## Key Components

| Component | Path | Responsibility |
|-----------|------|----------------|
| ResumeAssistant | `src/components/ResumeAssistant.tsx` | Main assistant interface |
| ChatSessionList | `src/components/ResumeAssistant/ChatSessionList.tsx` | Session list sidebar |
| ChatMessage | `src/components/ResumeAssistant/ChatMessage.tsx` | Individual message rendering |
| StreamingMessage | `src/components/ResumeAssistant/StreamingMessage.tsx` | Real-time streaming display |
| ToolCallTimeline | `src/components/ResumeAssistant/ToolCallTimeline.tsx` | Tool call visualization |
| StopButton | `src/components/ResumeAssistant/StopButton.tsx` | Stop generation control |

## Service Dependencies

### Session Management

```typescript
interface IAgentService {
  // Session CRUD
  createSession(title?: string): Promise<AgentSession>;
  getSession(id: string): Promise<AgentSession | null>;
  listSessions(): Promise<AgentSession[]>;
  updateSession(id: string, updates: Partial<AgentSession>): Promise<AgentSession>;
  deleteSession(id: string): Promise<void>;
  duplicateSession(id: string, title?: string): Promise<AgentSession>;
}
```

### Streaming & Controls

```typescript
interface IAgentService {
  // Streaming chat
  streamChat(sessionId: string, message: string, onToken: (token: string) => void): Promise<void>;
  stopGeneration(sessionId: string): Promise<void>;
  
  // Undo
  undoLastMessage(sessionId: string): Promise<AgentSession>;
}
```

### Tool Call Events

```typescript
interface ToolCallEvent {
  id: string;
  toolName: string;
  status: 'running' | 'success' | 'error';
  startedAt: number;
  completedAt?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
}

// Streaming callback includes tool events
interface StreamCallbacks {
  onToken: (token: string) => void;
  onToolCall?: (event: ToolCallEvent) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}
```

## Data Models

```typescript
interface AgentSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  toolCalls: ToolCallEvent[];
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: string[]; // IDs of associated tool calls
  createdAt: string;
}
```

## UI Specifications

### Session List Sidebar

- Display sessions in reverse chronological order
- Show session title (user-defined or auto-generated from first message)
- Show preview of last message or creation date
- Context menu: Rename, Duplicate, Delete
- Active session is highlighted
- "New Session" button at top

### Streaming Message Display

- Animate text appearance (cursor or fade-in)
- Show typing indicator before first token
- Preserve markdown formatting as text streams
- Scroll-to-bottom as new content arrives

### Stop Button

- Replace send button during active generation
- Red/stop icon color
- Positioned next to input field
- Disabled state when no generation in progress

### Undo

- Available in message actions (hover menu on user messages)
- Keyboard shortcut: Cmd/Ctrl+Z
- Confirmation toast: "Message undone"
- Undo stack limited to prevent memory issues (recommend: 10 levels)

### Tool Call Timeline

- Indented under the assistant message that triggered them
- Status icons: spinner (running), check (success), x (error)
- Collapsible by default (show summary, hide details)
- Expandable to show input/output JSON
- Error state shows error message prominently

## Design References

- See: `docs/product-specs/agent-foundation.md` — Agent architecture and grounding
- See: `docs/product-specs/ai-agents.md` — Resume Architect agent responsibilities
- See: `docs/FRONTEND.md` — Card patterns, button styles
- See: `docs/RELIABILITY.md` — Error handling, retry patterns

## Success Metrics

| Metric | Target |
|--------|--------|
| Session creation rate | ≥ 1.5 sessions per user per week |
| Session management actions (rename/duplicate) | ≥ 20% of sessions modified |
| Stop generation usage | Track usage, no specific target |
| Undo usage | Track usage, no specific target |
| Tool call visibility engagement | ≥ 50% of users expand tool calls |

## Implementation Notes

- Session storage uses `IUserService` for persistence (via Electron IPC)
- Streaming uses EventEmitter pattern for cross-process communication
- Undo is implemented by truncating message array, not via diff/patch
- Tool calls are part of the session model, not separate entities