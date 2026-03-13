# Design Decision: Agent Foundation Architecture

**Status**: ✅ Current (verified 2026-03-13)
**Author**: OpenCode

## Problem Statement

Mockvue has AI features under `IAgentService`, but the implementation is mostly specialized methods rather than a reusable, read-only, tool-driven assistant runtime. We need a foundation that powers multiple domain assistants without creating a second execution engine.

## Decision

Keep one public AI surface in `IAgentService`, but build a reusable internal runtime under `electron/agent/`.

The foundation will:
- reuse the existing service abstraction model
- keep assistants read-only except for agent-owned memory
- separate canonical user data from assistant memory
- support multiple assistants through one runtime with different prompts/config

### Internal Module Layout

- `electron/agent/runtime.ts` — turn loop and step orchestration
- `electron/agent/tools.ts` — strict tool registry and allowlist
- `electron/agent/knowledge.ts` — normalized read model assembly from user data
- `electron/agent/memory-store.ts` — assistant/session memory persistence
- `electron/agent/prompts.ts` — prompt templates and assistant config
- `electron/agent/model.ts` — model wrapper

## Rationale

- Matches the existing architecture: UI -> service abstraction -> Electron
- Avoids adding new top-level services before they are product domains
- Keeps `useAgent()` as the main entry point for both resume and behavioral assistants
- Makes future scraper and voice work additive rather than destabilizing

## Data Boundaries

### Canonical User Data
Stored via `IUserService`:
- `Resume`
- `ResumeAnalysis`
- `CandidateProfile`
- `Story[]`
- `InterviewResponse[]`

### Assistant-Owned Data
Stored in dedicated agent persistence:
- `AgentSession`
- `MemoryEntry`
- `ContextSummary`

## Permission Model

Default deny.

Approved tools only:
- `resume_get`
- `resume_search`
- `memory_lookup`
- `memory_save`
- `memory_summarize`
- `memory_clear` (explicitly scoped)

Never expose:
- file writes
- patching
- shell execution
- arbitrary tasks
- direct mutation of resume, stories, or interview responses

## Runtime Model

The assistant loop should:
1. inspect memory
2. retrieve grounded resume/story/interview facts
3. answer only from retrieved evidence or stored memory
4. optionally persist useful assistant-owned memory

## Alternatives Considered

1. **New top-level memory or runtime service**
   - Rejected because it adds service sprawl before the product surface is proven.
2. **Keep building one-off agent methods only**
   - Rejected because resume assistant and behavioral assistant would duplicate logic and state handling.
3. **Build a separate execution engine outside the service layer**
   - Rejected because it breaks the repository's contract-first architecture.

## Implementation Requirements

- Extend `IAgentService` with session-oriented assistant methods
- Add strict schemas for assistant turns, sessions, memory, and normalized resume facts
- Keep existing `chatWithResume()` as a compatibility wrapper during migration
- Expose new runtime through Electron IPC only

## Verification Status

- [ ] Implemented
- [x] Documented
- [ ] Tests passing
