# Execution Plan: Agent Foundation Core

**Created**: 2026-03-13  
**Status**: Complete  
**Target**: Reusable read-only assistant runtime for Resume Assistant and Behavioral Assistant

## Objective

Build the reusable assistant foundation that powers multiple grounded domain assistants through one runtime under the existing `IAgentService` surface.

## Working Model

- Work isolation: dedicated git worktree `agent-foundation-core`
- Do not overlap with scraper ingestion internals or voice provider implementation
- This workstream owns shared contracts and runtime primitives

## Recent Accomplishments

The following features have been implemented as part of this execution plan:

### Session Management
- **Rename sessions**: Users can rename assistant sessions with inline editing
- **Delete sessions**: Sessions can be deleted with confirmation
- **Duplicate sessions**: Sessions can be duplicated, creating a copy with all messages

### Resume Snapshot Storage
- Resume snapshots are now stored per session, preserving the resume state at session creation
- Ensures historical sessions remain accurate to the resume content at the time

### Streaming Responses
- Real-time streaming responses with typewriter effect
- Progressive text display as tokens arrive from the AI
- Smooth, natural-feeling response delivery

### Stop Generating
- "Stop generating" button allows users to halt streaming mid-response
- Clean cancellation without leaving partial state

### Undo Functionality
- Undo capability to revert the last exchange
- Maintains conversation history integrity

### Tool Call Timeline
- Visual timeline of tool calls during streaming
- Shows knowledge retrieval and other tool operations in real-time
- Transparent visibility into assistant reasoning

### Auto-Generated Titles
- Session titles automatically generated from assistant's first response
- No manual title entry required for new sessions

## Phase 0: Contracts And Scaffolding ✅

### Deliverables
- product spec
- design decision doc
- active execution plan
- shared schema proposals

### Files
- `docs/product-specs/agent-foundation.md`
- `docs/design-docs/agent-foundation-architecture.md`
- `src/types.ts`
- `src/services/interfaces.ts`

### Exit Criteria
- shared types agreed
- `IAgentService` extension surface defined

## Phase 1: Internal Runtime Modules ✅

### Build
- `electron/agent/runtime.ts`
- `electron/agent/tools.ts`
- `electron/agent/knowledge.ts`
- `electron/agent/memory-store.ts`
- `electron/agent/prompts.ts`
- `electron/agent/model.ts`

### Required Outcomes
- strict tool allowlist
- normalized `ResumeDoc` assembly from user data
- assistant-owned memory persistence
- turn execution returning structured traces and reply

### Exit Criteria
- runtime can complete one read-only grounded turn end-to-end

## Phase 2: Service And IPC Integration ✅

### Build
- extend `IAgentService`
- add Electron implementation methods in `src/services/electron/agent.ts`
- wire IPC handlers in `electron/main.ts`
- expose narrow bridge methods in `electron/preload.ts`
- update `src/electron.d.ts`

### Compatibility Rule
- keep existing `chatWithResume()` as wrapper until UI migration is done

### Exit Criteria
- renderer can create or continue assistant sessions through `useAgent()`

## Phase 3: Resume Assistant Migration ✅

### Build
- migrate `ResumeChat.tsx` to use session runtime
- preserve current user experience on `/resume-review`
- ensure answers are grounded in:
  - `Resume`
  - `ResumeAnalysis`
  - `CandidateProfile`
  - `coreStoryMatches`

### Exit Criteria
- Resume Assistant is live on current chat surface
- no regression in current Resume Review flow

## Phase 4: Behavioral Assistant Foundation Hookup ✅

### Build
- wire the same runtime into `StoriesPage`
- pass selected story/category context into assistant turns
- optionally add `question_list` tool if needed for behavior coaching

### Exit Criteria
- behavioral coaching can run on same runtime with different prompt/config

## Phase 5: Hardening And Tests ✅

### Tests
- resume retrieval correctness
- fact search correctness
- memory save/lookup/summarize/clear
- permission deny tests
- stale-memory handling after resume updates
- wrapper compatibility tests for `chatWithResume()`

### Validation Commands
```bash
npx tsc --noEmit
npm run lint
npm test
```

## Risks

- merge conflicts in `src/services/interfaces.ts`, `electron/main.ts`, `electron/preload.ts`
- over-generalizing before resume assistant migration proves the runtime
- memory staleness after source resume changes

## Success Criteria

- one reusable runtime powers both assistants
- assistants remain read-only except memory
- user data and assistant memory remain separate stores