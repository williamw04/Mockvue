# Coaching Workspace - Design Plan

**Status**: Draft
**Last Updated**: 2026-03-23

## Overview

The Coaching Workspace is a dedicated page that provides a structured environment for resume coaching sessions. It complements the chat interface by providing visual workspace for goals, todos, staged changes, and progress tracking.

---

## Core Concept: Two-Panel Experience

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Coaching Workspace Page                                                     │
│                                                                             │
│  ┌─────────────────────────────────────┐  ┌───────────────────────────────┐ │
│  │       Workspace Panel               │  │      Chat Panel               │ │
│  │       (Goals, Todos, Changes)       │  │      (Conversation)           │ │
│  └─────────────────────────────────────┘  └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key insight from coaching analysis**: The chat is for conversation, the workspace is for structure. They work together:
- Chat: Agent asks questions, proposes changes, discusses strategy
- Workspace: Shows the state of the coaching engagement (goals, pending decisions, progress)

---

## Data Models

### CoachingSession

```typescript
interface CoachingSession {
  id: string;
  assistantId: 'resume-assistant' | 'behavioral-assistant';
  title: string;
  status: 'active' | 'completed' | 'paused';
  
  // Resume context (snapshot at session start)
  resumeSnapshotId: string;
  analysisSnapshotId: string;
  
  // Coaching-specific state
  goals: CoachingGoal[];
  todos: CoachingTodo[];
  stagedChanges: StagedChange[];
  changeLog: AcceptedChange[];
  diagnosis: DiagnosisResult | null;
  
  // User-level context (cross-session)
  userProfile: CoachingUserProfile;
}
```

### CoachingGoal

```typescript
interface CoachingGoal {
  id: string;
  type: 'score_improvement' | 'weakness_elimination' | 'section_overhaul' | 'role_tailoring' | 'custom';
  title: string;
  description: string;
  targetMetric?: string;        // e.g., "ats_score", "quantification_rate"
  targetValue?: number;
  currentValue?: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  progress: number;             // 0-100
}
```

### CoachingTodo

```typescript
interface CoachingTodo {
  id: string;
  goalId?: string;              // Optional link to parent goal
  title: string;
  targetType?: 'bullet' | 'section' | 'story' | 'general';
  targetId?: string;            // ID of bullet/section if applicable
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  proposedBy: 'user' | 'agent';
}
```

### StagedChange (Proposed but not yet applied)

```typescript
interface StagedChange {
  id: string;
  todoId?: string;
  
  // Change target
  targetPath: string;           // JSON path: "workExperiences[0].achievements[2]"
  targetType: 'bullet' | 'summary' | 'skill' | 'section';
  
  // Change content
  operation: 'replace' | 'insert' | 'delete';
  beforeValue: string;
  proposedValue: string;
  rationale: string;
  
  // Options (for multi-option proposals)
  alternatives?: {
    id: string;
    value: string;
    label: string;              // "Concise", "Detailed", "Metric-heavy"
  }[];
  
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
}
```

### AcceptedChange (Change log entry)

```typescript
interface AcceptedChange {
  id: string;
  stagedChangeId: string;
  targetPath: string;
  beforeValue: string;
  afterValue: string;
  actualImpact?: {
    scoreBefore: number;
    scoreAfter: number;
  };
  decision: 'accepted' | 'modified';
}
```

### DiagnosisResult

```typescript
interface DiagnosisResult {
  overallScore: number;
  atsScore?: number;
  sections: {
    name: string;
    score: number;
    issues: DiagnosisIssue[];
  }[];
  topIssues: {
    id: string;
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    affectedBullets?: string[];
    suggestedAction: string;
  }[];
  metrics: {
    quantificationRate: number;
    actionVerbDiversity: number;
    averageBulletLength: number;
    passiveVoiceCount: number;
  };
}
```

### CoachingUserProfile (Cross-session)

```typescript
interface CoachingUserProfile {
  // Target context
  targetRole?: string;
  targetIndustry?: string;
  targetCompanies?: string[];
  
  // Personal brand
  personalBrand?: string;           // "Innovative problem solver"
  presentationStyle?: string;       // "Confident, concise, data-driven"
  
  // Writing preferences
  writingPreferences: {
    tone?: string;
    bulletStyle?: 'concise' | 'detailed' | 'balanced';
    avoidPhrases?: string[];
  };
  
  // Known patterns
  knownStrengths: string[];
  knownWeaknesses: string[];
  
  // Version history
  resumeVersions: ResumeVersion[];
}
```

---

## New Agent Tools

```typescript
// Goal/TODO management
'goal_create'       // Create a coaching goal
'todo_create'       // Create a todo item
'todo_complete'     // Mark todo as complete

// Change proposal
'change_propose'    // Propose a change with 2-3 options
'change_status'     // Check pending change status

// Diagnosis
'diagnosis_run'     // Run full diagnosis
'diagnosis_get'     // Get current diagnosis

// User profile (cross-session)
'profile_get'       // Get user's coaching profile
'profile_update'    // Update user preferences

// Versioning
'version_create'    // Create a resume version snapshot
'version_list'      // List available versions
```

---

## Bullet Rewrite Workflow

### Current Problem
Agent provides one suggestion, user accepts/rejects. No conversation, no options.

### Proposed Workflow

```
1. IDENTIFY bullet to improve
   Agent: "Let's work on this bullet. Tell me about what you actually did."
   
2. DRAW OUT context through conversation
   Agent asks: "What was the impact? How many people? What was challenging?"
   User provides details naturally
   
3. GENERATE 2-3 options
   Agent: "Based on what you told me, here are three ways to phrase this:"
   
   ┌─────────────────────────────────────────────────────────┐
   │ Option A (Concise):                                     │
   │ "Led 8-person team to deliver $2M project in 6 months" │
   │                                                         │
   │ Option B (Detailed):                                    │
   │ "Led 8-person engineering team, delivering a $2M       │
   │  revenue platform in 6 months by implementing CI/CD"    │
   │                                                         │
   │ Option C (Impact-focused):                              │
   │ "Scaled team from 3 to 8 engineers, delivering $2M      │
   │  platform that increased customer retention by 15%"     │
   │                                                         │
   │ [Select A] [Select B] [Select C] [Modify]               │
   └─────────────────────────────────────────────────────────┘
   
4. USER SELECTS or requests modification

5. CONFIRM and stage change
   Agent: "Great choice. This addresses weak verb and adds metrics."
   
6. VERIFY improvement (re-score)
```

---

## UI Mockup

```
/coaching-workspace?session=xxx

┌─────────────────────────────────────────────────────────────────────────────┐
│ Session Header: [Title] [Score: 72 → Target: 85] [Reanalyze]               │
├────────────────────────────────────────────────────────────┬────────────────┤
│  Workspace Sidebar                    Chat Panel           │                │
│  ┌─────────────────────┐              ┌──────────────────┐ │                │
│  │ 📊 Diagnosis        │              │                  │ │                │
│  │    Score: 72        │              │   Chat messages  │ │                │
│  ├─────────────────────┤              │                  │ │                │
│  │ 🎯 Goals            │              ├──────────────────┤ │                │
│  │   ☐ Score 72→85    │              │ Proposed Change  │ │                │
│  │   ☐ Fix 3 weak     │              │ [Before/After]   │ │                │
│  ├─────────────────────┤              │ [Accept] [Reject]│ │                │
│  │ ✓ Todos            │              └──────────────────┘ │                │
│  │   ☐ Rewrite bullet │                                   │                │
│  │   ✓ Fix summary    │              ┌──────────────────┐ │                │
│  ├─────────────────────┤              │ [Type message...] │ │                │
│  │ ⏳ Pending Changes  │              │ [Send] [Stop]    │ │                │
│  │   2 changes waiting │              └──────────────────┘ │                │
│  ├─────────────────────┤                                   │                │
│  │ 📝 Change Log       │                                   │                │
│  └─────────────────────┘                                   │                │
└────────────────────────────────────────────────────────────┴────────────────┘
```

---

## Implementation Phases

### Phase 1: Data Models & Storage
- Define TypeScript types
- Create `CoachingStore` class
- Persist to `{userData}/coaching-data/coaching.json`
- Create IPC handlers

### Phase 2: Service Layer
- Add `ICoachingService` to interfaces
- Implement Electron service
- Add to service context

### Phase 3: Agent Tools
- Add new coaching tools
- Update system prompt with coaching methodology
- Test tool calling

### Phase 4: UI Components
- Create `CoachingWorkspacePage`
- Create workspace sidebar components
- Create change proposal/diff components
- Integrate with chat

### Phase 5: Bullet Rewrite Flow
- Implement conversation state tracking
- Implement option generation
- Create selection UI in chat

### Phase 6: Versioning
- Implement version snapshots
- Create version history UI
- Implement restore

---

## Open Questions for User

1. **Layout**: Separate page (`/coaching-workspace`) or integrated into Resume Review page?

2. **Chat placement**: Side panel, modal overlay, or full-width with collapsible sidebar?

3. **Change application**: Immediately upon acceptance, batch at end, or manual "Apply All"?

4. **Multi-option UI**: Inline in chat, expandable card, or side-by-side comparison panel?