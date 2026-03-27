# Assistant Memory System Analysis

**Status**: Draft
**Last Updated**: 2026-03-23

## Purpose

This document analyzes the current memory implementation, identifies open questions, and defines use cases to inform the correct design for Mockvue's assistant memory system.

---

## Current Implementation

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      AgentRuntime                                │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │ ModelClient │  │ ToolExecutor │  │   MemoryStore         │   │
│  │ (Gemini)    │  │ (9 tools)    │  │ (persisted to disk)   │   │
│  └─────────────┘  └──────────────┘  └───────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   {userData}/agent-data/      │
              │   memory.json                 │
              │                               │
              │   - sessions[]                │
              │   - messages{sessionId: []}   │
              │   - memories[]                │
              │   - summaries[]               │
              └───────────────────────────────┘
```

### What's Stored

| Entity | Purpose | Current Usage |
|--------|---------|---------------|
| **Session** | Chat container with metadata | Title, message count, timestamps, resume snapshots |
| **Messages** | Full conversation history | All user/assistant turns, used for context building |
| **Memories** | Assistant-stored facts | Per-session, populated via `memory_save` tool or auto-save |
| **Summaries** | Compact context | Generated but not used in prompts |

### Current Tools

```typescript
// Data retrieval (read-only, from canonical user data)
'resume_get'           // Full resume object
'resume_search'        // Fuzzy search across resume/story/analysis
'bullet_get_weakest'   // Lowest-scored bullets
'bullet_get_all'       // All bullets with optional score filter
'trigger_points_get'   // Trigger points from analysis
'story_get_all'        // All user stories

// Memory operations (assistant-owned)
'memory_lookup'        // Get memories for current session
'memory_save'          // Save a memory entry (preference/goal/fact)
'memory_clear'         // Clear all memories for session
```

### Current Memory Flow

```
User sends message
       │
       ├─► Stored as message (always)
       │
       ├─► Stored as memory (if includeMemory: true) ─── Currently hardcoded true
       │
       └─► LLM may call memory_save tool ─── Currently not prompted to do so
```

---

## Open Questions

### 1. What Should Be Remembered?

**Current behavior**: Every user message is saved as a "fact" if `includeMemory: true`

**Questions**:
- Is the user's question itself worth remembering?
- Or should we remember what the assistant *learned* about the user?
- Should memories be extracted/summarized, or stored verbatim?

**Example scenarios**:

| User says | What to remember? |
|-----------|-------------------|
| "Help me rewrite my weakest bullet" | Nothing (one-time request) |
| "I'm targeting senior engineering roles" | Preference: target_role = senior engineering |
| "I struggle with behavioral questions about conflict" | Weakness/gap to focus coaching on |
| "Make it more concise" | Preference: prefers concise writing style |

### 2. Session-Level vs. User-Level Memory

**Current behavior**: Memories are scoped to a single session

**Questions**:
- Should preferences (e.g., "I prefer concise rewrites") persist across all sessions?
- Should each assistant (resume vs. behavioral) have separate memory?
- Should memories be shared across assistants?

**Proposed levels**:

```
User-Level Memory (shared across all assistants)
├── Preferences (writing style, communication preferences)
├── Goals (target role, target companies, timeline)
└── Known gaps/weaknesses

Assistant-Level Memory
├── Resume Assistant: resume-specific context
└── Behavioral Assistant: story/interview-specific context

Session-Level Memory
├── Conversation-specific context
└── Temporary focus areas
```

### 3. Memory Lifecycle

**Questions**:
- When should memories expire or be archived?
- Should users be able to view/edit/delete memories?
- How do we handle conflicting memories?

### 4. Memory in Prompts

**Current behavior**: Memories exist but are NOT injected into system prompt

**Questions**:
- Where should memories appear in the prompt?
- How much memory context is too much?
- Should we summarize old memories?

---

## User Scenarios

### Scenario A: First-Time User

```
User journey:
1. Uploads resume, runs analysis
2. Opens Resume Chat
3. Asks: "What are my weakest areas?"
4. Asks: "Help me rewrite the first one"

What should be remembered?
- Nothing critical (exploratory conversation)
- Maybe: user is in "improvement mode"
```

### Scenario B: Targeted Preparation

```
User journey:
1. Has resume analyzed
2. Opens Resume Chat
3. Says: "I'm interviewing at Google for a senior SWE role next week"
4. Asks: "What should I focus on?"
5. Asks: "Help me prepare stories for my weakest trigger points"

What should be remembered?
- Target company: Google
- Target role: Senior SWE
- Timeline: Next week (urgent)
- Focus: Story preparation for weak areas
```

### Scenario C: Iterative Refinement

```
User journey:
1. Asks: "Rewrite this bullet to be more impactful"
2. Assistant provides verbose rewrite
3. User says: "Too long, make it concise"
4. Assistant provides shorter version
5. User says: "Good, now do the same for the next bullet"

What should be remembered?
- Preference: prefers concise writing
- This preference should apply to future rewrites in this session
- Should this persist to future sessions?
```

### Scenario D: Cross-Session Continuity

```
Session 1:
User: "I'm targeting fintech companies"
Assistant: [stores preference]

Session 2 (days later):
User: "How should I position my experience?"

What should happen?
- Assistant should remember fintech focus
- Contextualize advice for fintech industry
```

---

## Design Options

### Option 1: No Persistent Memory (Current-ish)

- Only chat history in each session
- No cross-session memory
- Each session starts fresh (with resume snapshot)

**Pros**: Simple, no privacy concerns
**Cons**: User repeats preferences, no personalization

### Option 2: User-Declared Preferences

- Explicit settings page for user preferences
- Target role, target companies, writing style preferences
- Assistant reads from settings, not inferred memory

**Pros**: User control, transparent
**Cons**: Requires manual setup, doesn't capture nuance

### Option 3: LLM-Extracted Memory

- LLM extracts memories from conversation
- Uses `memory_save` tool when it learns something important
- Memories structured (key-value) or unstructured (free text)

**Pros**: Automatic, captures nuance
**Cons**: LLM may over/under-save, needs clear prompting

### Option 4: Hybrid Approach

- User-declared preferences for explicit settings (target role, style)
- LLM-extracted memory for conversational nuances
- Separate memory scopes (user-level vs session-level)

**Pros**: Best of both worlds
**Cons**: More complex implementation

---

## Recommendations

### Phase 1: Define Memory Schema

Before implementation, define what types of memories matter:

```typescript
interface UserPreference {
  key: 'writing_style' | 'communication_preference' | 'focus_area';
  value: string;
  confidence: 'high' | 'medium' | 'low';  // How confident are we?
  source: 'user_declared' | 'inferred';
  createdAt: string;
  lastReferencedAt: string;
}

interface UserGoal {
  type: 'target_role' | 'target_company' | 'timeline' | 'skill_gap';
  value: string;
  status: 'active' | 'achieved' | 'abandoned';
  createdAt: string;
}
```

### Phase 2: Update Prompts

Add memory tools to system prompt with clear guidance on when to use them:

```
You have access to memory tools:
- memory_save: Use when you learn something IMPORTANT about the user's 
  preferences, goals, or context that should influence future responses.
  DO NOT save every message. Save only meaningful insights.
  
Examples of when to save:
- User states a target role or company
- User expresses a writing preference (concise, detailed, etc.)
- User identifies a specific weakness or gap they want to work on

Examples of when NOT to save:
- One-time questions ("rewrite this bullet")
- General exploration ("what are my weaknesses?")
- Temporary context that won't matter next session
```

### Phase 3: Inject Memory into Prompts

```typescript
// In buildSystemPrompt or turn execution
const userMemories = memoryStore.getUserLevelMemories(userId);
const sessionMemories = memoryStore.getSessionMemories(sessionId);

const memoryContext = `
[User Context]
${userMemories.map(m => `- ${m.key}: ${m.value}`).join('\n')}

[Session Focus]
${sessionMemories.map(m => `- ${m.content}`).join('\n')}
`;
```

---

## Next Steps

1. **Decide on memory scope**: User-level vs session-level vs both
2. **Define memory schema**: What types of memories do we store?
3. **Update prompts**: Give LLM clear guidance on when/how to use memory tools
4. **Implement memory injection**: Actually use stored memories in prompts
5. **Add memory management UI**: Let users view/edit their stored preferences (optional)

---

## Related Documents

- `docs/product-specs/agent-foundation.md` - Agent architecture
- `docs/product-specs/resume-assistant.md` - Resume Assistant UI/UX
- `electron/agent/memory-store.ts` - Current implementation
- `electron/agent/tools.ts` - Memory tools
- `electron/agent/prompts.ts` - System prompts