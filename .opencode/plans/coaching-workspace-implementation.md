# Coaching Workspace - Implementation Plan

**Status**: Active
**Created**: 2026-03-27

## Summary

Integrate a coaching workspace into the Resume Review page as Tab 1 (replacing/merging with Profile tab). The workspace has two panels: a sidebar showing goals/todos/diagnosis and an enhanced chat panel. Changes are proposed via agent, accepted/rejected immediately by user.

---

## Architecture Decisions

### Tab Layout (Post-Implementation)
```
Tab 1: Coaching (new - merges Profile tab content into workspace sidebar)
Tab 2: Bullet Analysis (existing)
Tab 3: Trigger Points (existing)
Tab 4: ATS Compatibility (existing)
```

### Two-Panel Layout (Coaching Tab)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Diagnosis Summary Bar - Score, top issues, progress]                      │
├─────────────────────────────────────┬───────────────────────────────────────┤
│  Workspace Sidebar (collapsible)    │  Chat Panel (enhanced ResumeChat)     │
│  - Goals with progress              │  - Same chat interface                │
│  - Todos (checkable)                │  - ChangeProposalCard inline          │
│  - Candidate strengths (from Profile│  - TodoTaskCard inline                │
│    tab, now shown here)             │  - Multi-option selection UI          │
│  - Pending changes count            │                                       │
│  - Version history                  │                                       │
└─────────────────────────────────────┴───────────────────────────────────────┘
```

### User Preferences & AI Consent
- Add `aiAnalysisConsent` to `UserProfile` type
- Ask during onboarding (ResumeUploadStep) and on first visit to Resume Review
- If no consent: only show ATS tab, coaching tabs hidden
- If consent: full analysis auto-runs on upload, coaching tab available

### Session Flow
```
1. User navigates to Resume Review with analysis available
2. Coaching tab auto-creates or resumes most recent session
3. Session starts with auto-snapshot of current resume state
4. Agent runs diagnosis, presents findings
5. User and agent collaborate on goals/todos
6. Changes proposed inline in chat, accepted/rejected immediately
7. Accepted changes apply to canonical resume data right away
8. Re-analysis triggers on demand (only changed bullets)
```

### Change Application
- StagedChange created by agent via tool
- User sees ChangeProposalCard in chat with before/after
- Accept → immediately writes to canonical resume via service
- Reject → agent notified, asks why, tries again
- After acceptance, re-score affected bullet(s)

### Version Snapshots
- Auto-snapshot on session creation (labeled with date)
- Auto-snapshot before batch of accepted changes
- Manual snapshot available
- Snapshot = resume + analysis at that point in time

---

## Phase 1: Types & Data Models (No dependencies, start here)

### Task 1A: Add coaching types to `src/types.ts`
**File**: `src/types.ts`

Add these types:
```typescript
// User AI preference
export interface UserAIPreferences {
  aiAnalysisConsent: boolean | null;   // null = not yet asked
  askedAt?: string;
}

// Coaching types
export type CoachingGoalType = 'score_improvement' | 'weakness_elimination' | 'section_overhaul' | 'role_tailoring' | 'custom';
export type CoachingGoalStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';
export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface CoachingGoal {
  id: string;
  sessionId: string;
  type: CoachingGoalType;
  title: string;
  description: string;
  targetMetric?: string;
  targetValue?: number;
  currentValue?: number;
  status: CoachingGoalStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
}

export interface CoachingTodo {
  id: string;
  sessionId: string;
  goalId?: string;
  title: string;
  description?: string;
  targetType?: 'bullet' | 'section' | 'story' | 'general';
  targetId?: string;
  status: TodoStatus;
  proposedBy: 'user' | 'agent';
  createdAt: string;
  completedAt?: string;
}

export type StagedChangeStatus = 'pending' | 'accepted' | 'rejected' | 'modified';

export interface ChangeAlternative {
  id: string;
  value: string;
  label: string;
  predictedScore?: number;
}

export interface StagedChange {
  id: string;
  sessionId: string;
  todoId?: string;
  targetPath: string;
  targetType: 'bullet' | 'summary' | 'skill' | 'section';
  operation: 'replace' | 'insert' | 'delete';
  beforeValue: string;
  proposedValue: string;
  rationale: string;
  alternatives?: ChangeAlternative[];
  selectedAlternativeId?: string;
  status: StagedChangeStatus;
  createdAt: string;
  decidedAt?: string;
}

export interface AcceptedChange {
  id: string;
  sessionId: string;
  stagedChangeId: string;
  targetPath: string;
  beforeValue: string;
  afterValue: string;
  scoreBefore?: number;
  scoreAfter?: number;
  decision: 'accepted' | 'modified';
  userModification?: string;
  createdAt: string;
}

export interface ResumeVersion {
  id: string;
  sessionId: string;
  label: string;
  trigger: 'manual' | 'session-start' | 'pre-change';
  resumeData: Resume;
  analysisData: ResumeAnalysis | null;
  score: number;
  createdAt: string;
}

export interface CoachingUserProfile {
  targetRole?: string;
  targetIndustry?: string;
  targetCompanies?: string[];
  personalBrand?: string;
  presentationStyle?: string;
  writingPreferences: {
    tone?: string;
    bulletStyle?: 'concise' | 'detailed' | 'balanced';
    avoidPhrases?: string[];
  };
  knownStrengths: string[];
  knownWeaknesses: string[];
}

export interface CoachingSessionData {
  sessionId: string;
  goals: CoachingGoal[];
  todos: CoachingTodo[];
  stagedChanges: StagedChange[];
  changeLog: AcceptedChange[];
  versions: ResumeVersion[];
  userProfile: CoachingUserProfile;
}
```

Also update `UserProfile` to include:
```typescript
export interface UserProfile {
  // ... existing fields
  aiPreferences?: UserAIPreferences;
}
```

### Task 1B: Add coaching types to `electron/internal-types.ts`
**File**: `electron/internal-types.ts`

Mirror the same coaching types for main-process usage. Keep `AgentAssistantId`, `AgentSession`, etc. as-is.

---

## Phase 2: Storage & Service Layer (Depends on Phase 1)

### Task 2A: CoachingStore - persistent storage
**File**: NEW `electron/agent/coaching-store.ts`

```typescript
class CoachingStore {
  // Persists to {userData}/coaching-data/coaching.json
  // Manages: goals, todos, staged changes, change log, versions, user profile
  
  // Goals
  addGoal(sessionId, goal): CoachingGoal
  updateGoal(sessionId, goalId, updates): CoachingGoal
  getGoals(sessionId): CoachingGoal[]
  
  // Todos
  addTodo(sessionId, todo): CoachingTodo
  updateTodo(sessionId, todoId, updates): CoachingTodo
  getTodos(sessionId): CoachingTodo[]
  
  // Staged changes
  proposeChange(sessionId, change): StagedChange
  acceptChange(sessionId, changeId, modification?): AcceptedChange
  rejectChange(sessionId, changeId): void
  getPendingChanges(sessionId): StagedChange[]
  
  // Change log
  getChangeLog(sessionId): AcceptedChange[]
  
  // Versions
  createVersion(sessionId, label, trigger): ResumeVersion
  listVersions(sessionId): ResumeVersion[]
  getVersion(versionId): ResumeVersion | null
  
  // User profile (cross-session)
  getUserProfile(): CoachingUserProfile
  updateUserProfile(updates): CoachingUserProfile
}
```

### Task 2B: IPC Handlers
**File**: `electron/main.ts` (add coaching IPC handlers)

Add handlers for:
- `coaching:get-session-data` - Get goals, todos, changes for session
- `coaching:add-goal`, `coaching:update-goal`
- `coaching:add-todo`, `coaching:update-todo`
- `coaching:propose-change`, `coaching:accept-change`, `coaching:reject-change`
- `coaching:get-change-log`
- `coaching:create-version`, `coaching:list-versions`, `coaching:restore-version`
- `coaching:get-user-profile`, `coaching:update-user-profile`
- `coaching:rescore-bullets`
- `user:get-ai-preferences`, `user:set-ai-preferences`

### Task 2C: Preload exposure
**File**: `electron/preload.ts`

Expose coaching IPC methods via `window.electronAPI`.

### Task 2D: Service interface & implementation
**Files**: `src/services/interfaces.ts`, `src/services/electron/coaching.ts`

Add `ICoachingService` to interfaces, implement in electron service.

### Task 2E: Service context wiring
**File**: `src/services/ServiceContext.tsx` (or equivalent)

Wire `ICoachingService` into the service context so components can `useCoaching()`.

---

## Phase 3: Agent Tools & Prompt (Depends on Phase 1, can parallel with Phase 2)

### Task 3A: New coaching tools
**File**: `electron/agent/tools.ts`

Add tools:
```
goal_create(sessionId, type, title, description, targetMetric?, targetValue?)
todo_create(sessionId, title, goalId?, targetType?, targetId?)
todo_complete(sessionId, todoId)
change_propose(sessionId, targetPath, targetType, operation, proposedValue, rationale, alternatives?)
profile_get()
profile_update(targetRole?, targetIndustry?, personalBrand?, writingPreferences?)
version_create(sessionId, label)
```

### Task 3B: Updated system prompt
**File**: `electron/agent/prompts.ts`

Rewrite `RESUME_ASSISTANT_PROMPT` with coaching methodology:
- Diagnose first, then educate, then propose
- Ask questions to draw out context before rewriting
- Offer 2-3 alternatives with trade-offs
- Use goal/todo tools for structured coaching
- Inject user profile context into prompt

### Task 3C: Inject user profile into prompt
**File**: `electron/agent/prompts.ts` or `electron/agent/runtime.ts`

Load `CoachingUserProfile` and inject into system prompt at turn start.

---

## Phase 4: UI Components (Depends on Phase 2 & 3)

### Task 4A: CoachingWorkspaceSidebar component
**File**: NEW `src/components/profile/CoachingWorkspaceSidebar.tsx`

Sidebar showing:
- Diagnosis summary (score, top issues)
- Goals list with progress bars
- Todos list with checkboxes
- Candidate strengths (migrated from Profile tab)
- Pending changes count
- Version history (collapsible)

### Task 4B: ChangeProposalCard component
**File**: NEW `src/components/profile/ChangeProposalCard.tsx`

Inline chat component showing:
- Before/after diff
- 2-3 alternative options (selectable)
- Rationale text
- Accept / Reject / Modify buttons
- Predicted score change

### Task 4C: TodoTaskCard component
**File**: NEW `src/components/profile/TodoTaskCard.tsx`

Inline chat component showing todo created by agent:
- Checkbox + title
- Target (bullet/section)
- Status indicator

### Task 4D: AI Consent Banner
**File**: NEW `src/components/profile/AIConsentBanner.tsx`

Banner shown on Resume Review page if `aiAnalysisConsent` is null:
- "Allow AI to analyze your resume?"
- Brief explanation of what's analyzed
- Allow / Deny buttons
- Persists to user profile

### Task 4E: Integrate Coaching Tab into ResumeReviewPage
**File**: `src/components/ResumeReviewPage.tsx`

Changes:
- Tab order: Coaching (1), Bullets (2), Triggers (3), ATS (4)
- Remove Profile tab (content moved to Coaching sidebar)
- Coaching tab renders: sidebar + enhanced chat
- Pass coaching service to components
- AI consent check before showing coaching

### Task 4F: Enhance ResumeChat for coaching
**File**: `src/components/profile/ResumeChat.tsx`

Changes:
- Accept and render ChangeProposalCard messages from agent
- Accept and render TodoTaskCard messages from agent
- Add multi-option selection UI
- Wire accept/reject to coaching service
- On accept: apply change to resume, show confirmation
- On reject: notify agent to ask why

---

## Phase 5: Integration & Refinement (Sequential, after Phase 4)

### Task 5A: End-to-end flow testing
- Upload resume → AI consent → analysis → coaching tab → agent proposes changes → accept/reject
- Verify changes persist to canonical resume
- Verify re-scoring works
- Verify session persistence

### Task 5B: Prompt refinement
- Test coaching prompts with real scenarios
- Tune when agent creates goals vs just helps
- Ensure agent asks questions before proposing rewrites

### Task 5C: Version snapshot testing
- Auto-snapshot on session start
- Version list display
- Restore functionality

---

## Parallel Execution Plan

```
Phase 1 (sequential, ~30 min)
├── Task 1A: Types in src/types.ts
└── Task 1B: Types in electron/internal-types.ts

Phase 2 (parallel after Phase 1, ~2 hrs)
├── Task 2A: CoachingStore storage
├── Task 2B: IPC handlers
├── Task 2C: Preload exposure
├── Task 2D: Service interface + implementation
└── Task 2E: Service context wiring

Phase 3 (parallel with Phase 2, ~1.5 hrs)
├── Task 3A: New agent tools
├── Task 3B: Updated system prompt
└── Task 3C: Profile injection into prompt

Phase 4 (parallel after Phase 2+3, ~3 hrs)
├── Task 4A: CoachingWorkspaceSidebar
├── Task 4B: ChangeProposalCard
├── Task 4C: TodoTaskCard
├── Task 4D: AI Consent Banner
├── Task 4E: ResumeReviewPage integration
└── Task 4F: ResumeChat enhancements

Phase 5 (sequential, ~2 hrs)
├── Task 5A: E2E testing
├── Task 5B: Prompt refinement
└── Task 5C: Version snapshot testing
```

---

## Subagent Parallelization Strategy

### Batch 1 (Phase 1 - Sequential)
Single agent: Task 1A + 1B (types need to be consistent)

### Batch 2 (Phase 2 + Phase 3 in parallel)
- **Agent A**: Task 2A (CoachingStore) → Task 2B (IPC) → Task 2C (Preload)
- **Agent B**: Task 2D (Service interface) → Task 2E (Context wiring)
- **Agent C**: Task 3A (Agent tools) → Task 3B (Prompt) → Task 3C (Profile injection)

### Batch 3 (Phase 4 - Parallel after Batch 2)
- **Agent D**: Task 4A (Sidebar) + Task 4E (Page integration)
- **Agent E**: Task 4B (ChangeProposalCard) + Task 4C (TodoTaskCard) + Task 4F (Chat enhancements)
- **Agent F**: Task 4D (AI Consent Banner)

### Batch 4 (Phase 5 - Sequential)
Manual testing and refinement