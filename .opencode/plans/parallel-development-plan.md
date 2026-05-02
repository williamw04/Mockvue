# Parallel Development Plan - Mockvue Features

**Created**: 2026-03-23
**Status**: Draft

## Current State Summary

| Feature | Status | Worktree | Branch |
|---------|--------|----------|--------|
| Agent Foundation | ✅ Complete | main repo | `feature/ai-agents` |
| Coaching Workspace | 🔄 In Design | main repo | `feature/ai-agents` |
| Question Ingestion | 📋 Planned | `mockvue-question-ingestion` | `question-ingestion-scraper` |
| Voice Interview | 📋 Planned | `mockvue-voice-rnd` | `voice-simulator-rnd` |
| Flashcards/Mock Tools | ❓ Undefined | - | - |
| Browser Extension | ❓ Undefined | - | - |

---

## Dependency Graph

```
                        ┌─────────────────────────────────────┐
                        │     AGENT FOUNDATION (Complete)     │
                        │  - Tool system                      │
                        │  - Session management               │
                        │  - Memory system                    │
                        │  - Streaming                        │
                        └──────────────┬──────────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│  COACHING WORKSPACE  │   │  QUESTION INGESTION  │   │   VOICE INTERVIEW    │
│  (Enhancement)       │   │  (Independent)       │   │   (Independent)      │
│                      │   │                      │   │                      │
│  Depends on:         │   │  Depends on:         │   │  Depends on:         │
│  - Agent Foundation  │   │  - Nothing           │   │  - Agent Foundation  │
│                      │   │                      │   │  - Question data (opt)│
│  Outputs:            │   │  Outputs:            │   │                      │
│  - Goals/Todos       │   │  - Company questions │   │  Outputs:            │
│  - Staged changes    │   │  - Provenance data   │   │  - Voice sessions    │
│  - Change tracking   │   │                      │   │  - Transcripts       │
└──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘
           │                          │                          │
           │                          │                          │
           ▼                          ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│  MOCK TOOLS          │   │  BEHAVIORAL ASST     │   │  FLASHCARDS          │
│  - Mock interviews   │   │  (Enhancement)       │   │  (New Feature)       │
│  - AI interviewer    │   │                      │   │                      │
│                      │   │  Can consume:        │   │  Can consume:        │
│  Depends on:         │   │  - Question data     │   │  - Question data     │
│  - Voice Interview   │   │                      │   │  - Resume data       │
│  - Question data     │   └──────────────────────┘   └──────────────────────┘
└──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        BROWSER EXTENSION (Future)                           │
│                                                                             │
│  Independent of main app, but communicates via IPC/API                     │
│  - Track applications                                                       │
│  - Track resume versions sent                                               │
│  - Interview outcome logging                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Parallel Work Streams

### Stream 1: Coaching Workspace Enhancement (Main Repo)
**Worktree**: `/Users/williamwu/Documents/academics/class/RCOS/Mockvue`
**Can Start**: Immediately

| Task | Dependencies | Est. Effort |
|------|--------------|-------------|
| Define data models (Goals, Todos, StagedChanges) | None | 1 day |
| Create `ICoachingService` interface | Data models | 0.5 day |
| Implement `CoachingStore` persistence | Data models | 1 day |
| Add coaching tools to agent | Service layer | 1 day |
| Update system prompt for coaching methodology | None | 0.5 day |
| Build workspace UI components | Service layer | 3 days |
| Implement bullet rewrite workflow (multi-option) | UI + tools | 2 days |
| Version control for resume data | CoachingStore | 1 day |

**Total Est.**: ~10 days

---

### Stream 2: Question Ingestion Pipeline (Dedicated Worktree)
**Worktree**: `/Users/williamwu/Documents/academics/class/RCOS/mockvue-question-ingestion`
**Can Start**: Immediately (fully independent)

| Task | Dependencies | Est. Effort |
|------|--------------|-------------|
| Define schema (Company, Role, Question, Observation) | None | 1 day |
| Create source registry format | Schema | 0.5 day |
| Build fetch pipeline abstraction | Source registry | 1 day |
| Implement first scraper (e.g., Glassdoor/Levels.fyi) | Fetch pipeline | 2 days |
| Build extraction/normalization layer | Scraper | 2 days |
| Implement deduplication/clustering | Normalization | 2 days |
| Create query API for downstream consumers | All above | 1 day |
| Integration tests | All above | 1 day |

**Total Est.**: ~10 days

**Note**: Worktree is at older commit. Needs to be updated or worked on independently, then merged.

---

### Stream 3: Voice Interview Simulator (Dedicated Worktree)
**Worktree**: `/Users/williamwu/Documents/academics/class/RCOS/mockvue-voice-rnd`
**Can Start**: Immediately (types already defined in main repo)

| Task | Dependencies | Est. Effort |
|------|--------------|-------------|
| Define `IVoiceInterviewService` interface | None (types exist) | 0.5 day |
| Build text-first interview orchestrator | Interface | 2 days |
| Create provider adapter abstraction | Orchestrator | 1 day |
| Implement first provider (e.g., OpenAI Realtime API) | Adapter interface | 3 days |
| Electron IPC integration | Provider impl | 1 day |
| Transcript persistence | IPC | 1 day |
| UI for voice session | All above | 2 days |
| Fallback/error handling | All above | 1 day |

**Total Est.**: ~11 days

**Note**: Worktree is at older commit. Types exist in main repo's `internal-types.ts`.

---

### Stream 4: Flashcards & Practice Tools (New Worktree Recommended)
**Worktree**: Create new `mockvue-flashcard-tools`
**Can Start**: After Question Ingestion has data

| Task | Dependencies | Est. Effort |
|------|--------------|-------------|
| Define flashcard data model | None | 0.5 day |
| Create flashcard generation from resume/stories | Agent foundation | 1 day |
| Build spaced repetition logic | Data model | 1 day |
| Create flashcard UI components | Logic | 2 days |
| Integration with question bank | Question ingestion | 1 day |

**Total Est.**: ~5 days

---

### Stream 5: Mock Interview UI (Combined with Voice)
**Worktree**: Same as Voice Interview
**Can Start**: After Voice Interview has basic session support

| Task | Dependencies | Est. Effort |
|------|--------------|-------------|
| Define mock interview flow | None | 0.5 day |
| Create interviewer persona prompts | Voice orchestrator | 1 day |
| Build question selection/randomization | Question ingestion | 1 day |
| Create real-time transcript display | Voice session | 1 day |
| Implement "prying questions" logic | Agent foundation | 1 day |
| Post-interview feedback/analysis | All above | 2 days |

**Total Est.**: ~6 days

---

### Stream 6: Browser Extension (Future - New Repo)
**Worktree**: New repository recommended
**Can Start**: After core app is stable

| Task | Dependencies | Est. Effort |
|------|--------------|-------------|
| Define extension architecture | None | 1 day |
| Create manifest/background script | Architecture | 0.5 day |
| Build application detection | Platform research | 2 days |
| Create communication bridge to main app | Detection | 1 day |
| Build popup UI | All above | 2 days |
| Store application history | Storage | 1 day |

**Total Est.**: ~7 days

---

## Recommended Execution Order

### Phase 1: Foundation (Parallel - Week 1-2)

```
┌─────────────────────────────────────────────────────────────────┐
│  STREAM 1: Coaching Workspace     STREAM 2: Question Ingestion  │
│  - Data models                    - Schema definition           │
│  - Service interface              - Source registry             │
│  - CoachingStore                  - Fetch pipeline              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STREAM 3: Voice Interview                                       │
│  - Service interface                                              │
│  - Text-first orchestrator                                        │
│  - Provider abstraction                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2: Integration (Week 3-4)

```
┌─────────────────────────────────────────────────────────────────┐
│  STREAM 1: Coaching Workspace     STREAM 2: Question Ingestion  │
│  - Coaching tools                 - First scraper               │
│  - Workspace UI                   - Extraction layer            │
│  - Bullet rewrite flow            - Deduplication               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STREAM 3: Voice Interview        STREAM 5: Mock Interview UI   │
│  - Provider implementation         - Interview flow             │
│  - Electron integration            - Question selection         │
│  - Session UI                      - Transcript display         │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 3: Enhancement (Week 5-6)

```
┌─────────────────────────────────────────────────────────────────┐
│  STREAM 1: Versioning             STREAM 2: Query API           │
│  - Resume versions                 - Downstream consumers       │
│  - Restore functionality           - Behavioral asst hookup     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STREAM 4: Flashcards              STREAM 5: Feedback           │
│  - Spaced repetition               - Post-interview analysis    │
│  - UI integration                  - Improvement suggestions    │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 4: Extension (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│  STREAM 6: Browser Extension                                      │
│  - Application tracking                                           │
│  - Resume version tracking                                        │
│  - Outcome logging                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Worktree Management

### Current State
```bash
# Main development (feature/ai-agents)
/Users/williamwu/Documents/academics/class/RCOS/Mockvue

# Question ingestion (stale - needs update)
/Users/williamwu/Documents/academics/class/RCOS/mockvue-question-ingestion

# Voice interview (stale - needs update)
/Users/williamwu/Documents/academics/class/RCOS/mockvue-voice-rnd
```

### Recommended Actions

1. **Update worktrees to latest main**:
```bash
cd /Users/williamwu/Documents/academics/class/RCOS/mockvue-question-ingestion
git fetch origin
git rebase origin/main

cd /Users/williamwu/Documents/academics/class/RCOS/mockvue-voice-rnd
git fetch origin
git rebase origin/main
```

2. **Create new worktree for flashcards** (when ready):
```bash
cd /Users/williamwu/Documents/academics/class/RCOS/Mockvue
git worktree add ../mockvue-flashcard-tools -b flashcard-tools
```

3. **Create separate repo for extension** (when ready):
```bash
mkdir ../mockvue-extension
cd ../mockvue-extension
git init
```

---

## Cross-Stream Dependencies

| Stream | Produces | Consumed By |
|--------|----------|-------------|
| Coaching Workspace | Goals, changes, versions | - |
| Question Ingestion | Company questions | Behavioral Asst, Flashcards, Mock Interview |
| Voice Interview | Sessions, transcripts | Mock Interview UI |
| Agent Foundation | Tools, runtime | All streams |

---

## Open Questions for User

1. **Question Ingestion Sources**: Which websites should we target for scraping first?
   - Glassdoor
   - Levels.fyi
   - Blind
   - LeetCode
   - Other?

2. **Voice Provider**: Which voice provider should we implement first?
   - OpenAI Realtime API
   - ElevenLabs
   - Google Cloud Speech
   - Other?

3. **Flashcard Scope**: What content should flashcards cover?
   - Behavioral questions
   - Technical concepts
   - Company-specific knowledge
   - All of the above?

4. **Extension Priority**: Should the browser extension be prioritized for this phase, or deferred?

5. **Worktree Strategy**: Should we update existing worktrees or start fresh from current main?