# Feature Spec: Workspaces & Sessions

**Status**: Draft for Discussion  
**Last Updated**: 2026-03-23

---

## Core Concept

### Workspace

A **Workspace** is a persistent container that represents a user's coaching engagement. It contains everything about a user's resume improvement journey:

- Resume versions (snapshots over time)
- Profile (target role, preferences, strengths, weaknesses)
- Long-term goals (across all sessions)
- All session history

### Session

A **Session** is a single coaching conversation within a workspace. It contains:

- Chat messages (conversation)
- Session-specific todos (action items)
- Staged changes (pending proposals)
- Change log (accepted/rejected)
- Diagnosis (snapshot of resume state at session start)

---

## Visual Model

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WORKSPACE: "Google PM Prep"                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  Profile                                                         │ │
│  │  Target: Senior PM | Industry: Fintech | Brand: Data-driven    │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  Long-term Goals                                                 │ │
│  │  • Get resume score to 85+          [████████░░] 80%           │ │
│  │  • Prepare 5 STAR stories          [██████░░░░] 60%           │ │
│  │  • Tailor for Google                [░░░░░░░░░░] 0%            │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  Resume Versions (4)                            [+ New Version]  │ │
│  │  ─────────────────────────────────────────────────────────────  │ │
│  │  v4 (current) - Score: 82 - "After quantification pass"        │ │
│  │  v3 - Score: 78 - "After weak bullet fixes"                    │ │
│  │  v2 - Score: 71 - "Initial coaching session"                   │ │
│  │  v1 - Score: 65 - "Original upload"                            │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│  ┌─────────────────────────┐  ┌───────────────────────────────────┐ │
│  │     SESSIONS (3)         │  │                                   │ │
│  │     ─────────────        │  │         CHAT PANEL                 │ │
│  │  ┌───────────────────┐  │  │                                   │ │
│  │  │ ● Session 3       │  │  │   ┌─────────────────────────────┐ │ │
│  │  │   "Quantification│  │  │   │ Agent: Let's work on bullet │ │ │
│  │  │    improvements" │  │  │   │         #3...               │ │ │
│  │  │   Active ◉       │  │  │   │                             │ │ │
│  │  └───────────────────┘  │  │   │ User: How do I quantify..? │ │ │
│  │  ┌───────────────────┐  │  │   │                             │ │ │
│  │  │   Session 2       │  │  │   │ ────────────────────────── │ │ │
│  │  │   "Follow-up"     │  │  │   │ 📋 TODO: Add metrics to   │ │ │
│  │  │   Completed ✓     │  │  │   │         bullet #3         │ │ │
│  │  └───────────────────┘  │  │   └─────────────────────────────┘ │ │
│  │  ┌───────────────────┐  │  │                                   │ │
│  │  │ ○ Session 1       │  │  │  ┌─────────────────────────────┐ │ │
│  │  │   "Initial chat"  │  │  │  │ [Workspace Sidebar]         │ │ │
│  │  │   Archived        │  │  │  │ • Diagnosis: Score 82       │ │ │
│  │  └───────────────────┘  │  │  │ • Goals: 3 active           │ │ │
│  │                         │  │  │ • Todos: 2 pending          │ │ │
│  │  [+ New Session]        │  │  │ • Changes: 1 waiting        │ │ │
│  └─────────────────────────┘  │  └───────────────────────────────────┘ │
│                                 │                                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Workspace

```typescript
interface Workspace {
  id: string;
  userId: string;
  
  // Identity
  name: string;                     // Auto-generated or user-defined
                                    // e.g., "Google PM Prep", "Career Pivot 2026"
  
  // Current state
  currentResumeId: string;          // Pointer to latest version
  currentAnalysisId: string;        // Pointer to latest analysis
  activeSessionId: string | null;   // Which session is currently active
  
  // Profile (long-term, persists across sessions)
  profile: WorkspaceProfile;
  
  // Long-term goals (persist across sessions)
  goals: WorkspaceGoal[];
  
  // Version history
  versions: ResumeVersion[];
  
  // All sessions in this workspace
  sessionIds: string[];
  
  // Preferences
  createdAt: string;
  updatedAt: string;
}
```

### WorkspaceProfile

```typescript
interface WorkspaceProfile {
  // Target context
  targetRole?: string;              // "Senior Product Manager"
  targetIndustry?: string;         // "FinTech", "SaaS"
  targetCompanies?: string[];      // ["Google", "Stripe", "Airbnb"]
  
  // Personal brand
  personalBrand?: string;           // "Data-driven problem solver"
  presentationStyle?: string;       // "Concise and impact-focused"
  
  // Writing preferences
  writingPreferences: {
    tone?: string;
    bulletStyle?: 'concise' | 'detailed' | 'balanced';
    avoidPhrases?: string[];
  };
  
  // Inferred from coaching
  knownStrengths: string[];         // e.g., ["Technical depth", "Leadership"]
  knownWeaknesses: string[];        // e.g., ["Quantification", "Soft skills"]
  improvementHistory: {
    date: string;
    focus: string;
    outcome: string;
  }[];
}
```

### WorkspaceGoal

```typescript
interface WorkspaceGoal {
  id: string;
  workspaceId: string;
  
  // Definition
  type: 'score_target' | 'weakness_elimination' | 'role_tailoring' | 'skill_build' | 'custom';
  title: string;
  description?: string;
  
  // Metrics
  targetMetric?: string;            // "score", "quantification_rate"
  targetValue?: number;             // 85
  currentValue?: number;            // 72
  
  // Status
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'abandoned';
  progress: number;                 // 0-100
  
  // Relationships
  linkedSessionIds: string[];       // Sessions that worked on this goal
  
  createdAt: string;
  completedAt?: string;
}
```

### ResumeVersion

```typescript
interface ResumeVersion {
  id: string;
  workspaceId: string;
  
  // Identification
  label: string;                    // "Original", "After PM tailoring"
  versionNumber: number;            // 1, 2, 3...
  
  // Trigger
  trigger: 'upload' | 'session_start' | 'manual' | 'milestone' | 'fork';
  forkedFromVersionId?: string;     // If forked from another version
  
  // Data snapshot
  resumeData: Resume;
  analysisData: ResumeAnalysis | null;
  
  // Metrics at snapshot time
  metrics: {
    overallScore: number;
    atsScore?: number;
    quantificationRate: number;
    bulletCount: number;
  };
  
  createdAt: string;
}
```

### Session

```typescript
interface Session {
  id: string;
  workspaceId: string;
  
  // Identity
  title: string;                    // Auto-generated or user-defined
  status: 'active' | 'completed' | 'archived';
  
  // Parent relationships
  parentSessionId?: string;         // If forked from another session
  parentVersionId?: string;         // Version this session started with
  
  // Context (what resume version this session uses)
  resumeVersionId: string;          // Points to workspace.versions[]
  analysisVersionId: string;
  
  // Diagnosis (snapshot of resume state at session start)
  initialDiagnosis: DiagnosisResult | null;
  currentDiagnosis: DiagnosisResult | null;
  
  // Session-specific todos
  todos: SessionTodo[];
  
  // Change tracking
  stagedChanges: StagedChange[];
  changeLog: AcceptedChange[];
  
  // Chat messages
  messages: AgentChatMessage[];
  messageCount: number;
  
  // Timestamps
  createdAt: string;
  lastActiveAt: string;
  completedAt?: string;
}
```

### SessionTodo

```typescript
interface SessionTodo {
  id: string;
  sessionId: string;
  
  // Definition
  title: string;
  description?: string;
  targetType: 'bullet' | 'section' | 'trigger_point' | 'general';
  targetId?: string;               // ID of specific item
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  
  // Relationships
  goalId?: string;                 // Link to workspace goal if applicable
  
  createdAt: string;
  completedAt?: string;
}
```

### StagedChange

```typescript
interface StagedChange {
  id: string;
  sessionId: string;
  
  // Target
  targetPath: string;              // "workExperiences[0].achievements[2]"
  targetType: 'bullet' | 'summary' | 'skill' | 'project' | 'education';
  
  // Content
  operation: 'replace' | 'insert' | 'delete';
  beforeValue: string;
  proposedValue: string;
  rationale: string;                // Why this change helps
  
  // Options (if multiple were proposed)
  alternatives?: {
    id: string;
    value: string;
    label: string;                 // "Concise", "Detailed"
  }[];
  selectedAlternativeId?: string;
  userModifiedValue?: string;      // If user modified before accepting
  
  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  rejectionReason?: string;        // If rejected, what did user say?
  
  createdAt: string;
  decidedAt?: string;
}
```

---

## User Flows

### Flow 1: First-time User (New Workspace)

```
1. User uploads resume for first time
   │
   ├──► Check aiAnalysisConsent
   │
   ├──► 'denied' / 'not_set' → Show ATS only, no workspace created yet
   │
   └──► 'granted' 
         │
         ├──► Create Workspace (name: "Resume {date}")
         │
         ├──► Create ResumeVersion (trigger: 'upload')
         │
         ├──► Run analysis (if auto-analyze enabled)
         │
         ├──► Create Session (first session, status: 'active')
         │
         └──► Initialize workspace with:
              • Empty profile (target role, etc.)
              • Empty long-term goals
              • Initial diagnosis
              • Empty todos
```

### Flow 2: Returning User (Resume Workspace)

```
User opens Resume Review (aiAnalysisConsent = 'granted')
   │
   ├──► Load Workspace
   │
   ├──► Check for active session
   │
   ├──► Active session exists
   │     │
   │     └──► Resume session (load chat, todos, changes, diagnosis)
   │
   └──► No active session
         │
         ├──► Show "Continue" button (resume most recent)
         │
         └──► Show "New Session" button
                   │
                   ├──► Create new Session in workspace
                   ├──► Create ResumeVersion (trigger: 'session_start')
                   ├──► Run diagnosis for new version
                   └──► Initialize empty todos, staged changes
```

### Flow 3: Resume Re-upload

```
User uploads new resume version
   │
   ├──► Create ResumeVersion (trigger: 'upload')
   │
   ├──► Prompt user:
   │     │
   │     ├─► "Continue current session"
   │     │     → Update workspace.currentVersionId
   │     │     → Resume current session
   │     │
   │     ├─► "Start new session" (keep old)
   │     │     → Create new Session (status: 'active')
   │     │     → Mark old session as 'completed'
   │     │
   │     └─► "Archive workspace & start fresh" (rare)
   │           → Create new Workspace
   │           → Create new Session
   │
   └──► Run analysis on new version
```

### Flow 4: Fork/Version Branch

```
User wants to try a different direction (e.g., "Tailor for Google")
   │
   ├──► User clicks "Fork Version" on current version
   │
   ├──► Create ResumeVersion with:
   │     trigger: 'fork'
   │     forkedFromVersionId: current.id
   │
   ├──► Prompt: "What direction?" (e.g., "Google PM", "Startup VP")
   │
   ├──► Update workspace.profile with new target
   │
   └──► Continue in new version context
```

---

## Tab Visibility & Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  Resume Review Page Tabs                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Coaching] [ATS]                                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Coaching Tab Content                                │   │
│  │  ┌───────────────────┬────────────────────────────┐ │   │
│  │  │                   │                            │ │   │
│  │  │  Workspace        │      Chat + Workspace      │ │   │
│  │  │  Sidebar          │      Panel                 │ │   │
│  │  │                   │                            │ │   │
│  │  │  • Version picker│                            │ │   │
│  │  │  • Sessions list │                            │ │   │
│  │  │  • Goals          │                            │ │   │
│  │  │  • Todos          │                            │ │   │
│  │  │  • Changes       │                            │ │   │
│  │  │                   │                            │ │   │
│  │  └───────────────────┴────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tab Logic

| Consent Status | Visible Tabs | Default Tab |
|----------------|--------------|-------------|
| `granted` | Coaching, ATS | Coaching |
| `denied` | ATS only | ATS |
| `not_set` | ATS only (+ consent prompt) | ATS |

---

## Key Design Decisions Needed

### Q1: Workspace Creation Trigger

**Question**: When does a workspace get created?

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A) First resume upload** | Workspace created immediately on first upload | Simple, predictable | Users without consent get empty workspace |
| **B) First AI consent** | Only when user grants AI analysis | Only meaningful for coaching users | Extra step before coaching |
| **C) First coaching session** | Only when user clicks "Start Coaching" | Minimal setup | Less discoverability |

**Recommendation**: Option A (first upload) - simplest model, workspace exists but coaching features only show when consent granted.

---

### Q2: Session Auto-Complete

**Question**: When should a session be marked 'completed'?

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A) User closes/leaves** | Auto-complete after inactivity | Easy | May mark still-active conversations |
| **B) User explicitly completes** | User clicks "Complete Session" | Accurate | User might forget |
| **C) Time-based** | Auto-complete after 7 days of inactivity | Good default | Arbitrary |

**Recommendation**: Option B + auto-archive after 30 days of inactivity. User explicitly completes when satisfied, but old sessions get archived.

---

### Q3: Change Application

**Question**: When exactly are accepted changes applied to the resume?

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A) Immediate on accept** | Apply as soon as user clicks Accept | Instant feedback | May create many versions if user changes mind |
| **B) Batch at session end** | Apply all at "Complete Session" | Fewer versions | Undo is harder |
| **C) Manual "Apply" button** | Separate apply step | Full control | Extra click |

**Recommendation**: Option A for immediate, but auto-snapshot before batch to allow undo.

---

### Q4: Workspace Names

**Question**: How should workspaces be named?

| Option | Description | Example |
|--------|-------------|---------|
| **A) Auto-generated** | Based on target company/role | "Google PM Prep" |
| **B) User-defined** | User enters name | "Career Pivot 2026" |
| **C) Both** | User can customize default | Default "Resume Jan 2026" |

**Recommendation**: Option C - auto-generated with defaults, but user can rename.

---

### Q5: Rejected Change Handling

**Question**: What happens when user rejects a proposal?

| Current Behavior | Proposed Behavior |
|------------------|-------------------|
| Just mark as rejected | Agent is notified, asks "What would you prefer?" |

**Flow**:
```
Agent proposes change
User clicks "Reject"
   │
   ├─► Agent receives rejection event
   │
   ├─► Agent asks follow-up:
   │     "What would you prefer? More concise? Different focus?"
   │
   ├─► User explains preference
   │
   ├─► Agent: 
   │     • Updates user preference (e.g., "prefers concise")
   │     • Generates new proposal based on preference
   │     • Or acknowledges can't accommodate
   │
   └─► Log rejection reason for learning
```

---

## Open Questions for Discussion

1. **Workspace vs Session naming**: Should we call it "Workspace" to users, or something more intuitive like "Resume Project" or "Coaching Journey"?

2. **Multiple workspaces**: Should users be able to have multiple workspaces (e.g., one for "Google PM" and one for "Startup VP")? If so, how do they switch between them?

3. **Session forking**: When should a session be forked vs. continued in the same session?

4. **Data migration**: For existing users with sessions (from current implementation), should we:
   - Migrate to new workspace model
   - Keep legacy data separate
   - Start fresh

5. **Guest mode**: If user hasn't completed onboarding but wants to try coaching, can they? Or is full onboarding required first?

---

## Implementation Notes

### Migration Path

1. **Phase 1**: Add data models, keep existing sessions working
2. **Phase 2**: Add workspace layer, migrate existing sessions
3. **Phase 3**: New UX with workspace sidebar

### Backward Compatibility

- Keep existing `AgentSession` model for now
- Map: 1 Workspace = 1+ legacy AgentSessions
- New fields added to existing storage, not replacing

---

## Related Documents

- `.opencode/plans/coaching-workspace-design.md` - Previous iteration
- `docs/design-docs/assistant-memory-analysis.md` - Memory analysis
- `docs/product-specs/agent-foundation.md` - Agent foundation

---

## Next Steps

1. [ ] Validate this model with user mental models
2. [ ] Decide on open questions
3. [ ] Update implementation plan with workspace structure
4. [ ] Begin Phase 1 implementation