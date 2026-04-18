# Feature: AI Interview Prep Agents

**Status**: In Progress (Phase 1 Complete)  
**Last Updated**: 2026-03-06

## User Story

As a job seeker, I want a guided, multi-agent AI workflow that transforms my raw resume into strategic interview-ready narratives so that I can confidently deliver polished, compelling answers in behavioral interviews.

## Overview

Mockvue's AI backbone is a **three-agent handoff pipeline**. Each agent has a distinct persona and responsibility, and the output of one feeds directly into the next. Together, they take a user from "I have a resume" to "I can nail any behavioral question."

```mermaid
graph LR
    A["📄 Resume Architect"] -->|Trigger Points & Profile| B["🎯 Narrative Coach"]
    B -->|Content Matrix & Polished Stories| C["🎤 Mock Simulator"]
    
    subgraph "User Data"
        R["Resume / Experiences"]
        S["Core Stories Library"]
    end

    R --> A
    S --> B
    B --> S
```

> [!IMPORTANT]
> This spec **fully supersedes** the deferred [AI Assistant](./ai-assistant.md) spec. The generic chat-style AI assistant is replaced by these three purpose-built agents. Existing `IAgentService` methods will be extended to support agent-specific workflows.

---

## Agent 1: The Resume Architect

**Persona**: A strategic resume consultant who thinks like a recruiter.  
**Trigger**: User uploads or edits resume data during onboarding or from the Profile page.  
**Primary Surface**: `/resume-review` — Standalone Resume Review page with 3-step tab flow + chat sidebar.

### Current Implementation (Phase 1 ✅)

The Resume Architect currently provides:

| Feature | Status | Description |
|---------|--------|-------------|
| **Bullet Analysis** | ✅ Done | Scores each bullet for impact (1-10), flags weak verbs, missing metrics, passive voice. Suggests rewrites. |
| **Trigger Point Detection** | ✅ Done | Identifies resume elements recruiters will probe (gaps, short tenures, role changes, bold claims). |
| **Candidate Profile** | ✅ Done | Compiles strengths, trigger points, story readiness, and overall score (0-100). Auto-saved to disk. |
| **Contextual Chat** | ✅ Done | Sidebar chat agent with full analysis context. Users can ask about specific bullets, get advice, etc. |
| **Analysis Caching** | ✅ Done | Analysis persisted to `resume-analysis.json`. Loads instantly on return visits. Reanalyze button available. |
| **Dashboard Widget** | ✅ Done | Gamified score ring on Dashboard with strengths/gaps stats and CTA arrow. |

### User Scenarios

| # | Scenario | Priority | Status |
|---|----------|----------|--------|
| 1 | **Generic Review**: "Analyze my resume and tell me what's weak" | P0 | ✅ Done |
| 2 | **Tailored Review**: "I'm applying to Google for SWE — how does my resume hold up?" | P0 | 🔜 Planned |
| 3 | **Gap Story Coaching**: "I have a 6-month gap — help me prepare a story" | P0 | 🔜 Planned |
| 4 | **Inline Bullet Rewriting**: "Rewrite my weakest 5 bullets and let me accept/reject" | P1 | 🔜 Planned |
| 5 | **ATS Keyword Check**: "Will this pass an ATS scan for data engineering?" | P1 | 🔜 Planned |
| 6 | **Score History**: "How does my new score compare to last week?" | P2 | 🔜 Planned |
| 7 | **Section Structure Advice**: "Should I include my projects section?" | P2 | 🔜 Planned |

### Core Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Trigger Point Engineering** | Transform passive bullet points into strategic "hooks" — statements that tease the _what_ and the _impact_ but intentionally omit the _how_, forcing the interviewer to ask for the story. |
| **Quantification Forcing** | Actively prompt the user to surface metrics using Google's XYZ Formula: "Accomplished [X] as measured by [Y], by doing [Z]." |
| **Framework Application** | Enforce scannable structures — **PSR** (Problem-Solution-Result) or **CAR** (Challenge-Action-Result) — on every bullet point. |
| **Knowledge Transfer** | Compile a structured **Candidate Profile** (top achievements, competencies, and teased narratives) to pass to the Narrative Coach. |
| **Tailored Matching** *(Planned)* | Score resume against a specific job description or target company. Flag missing keywords, role-fit issues, and suggest which bullets to emphasize. |
| **Gap Story Coaching** *(Planned)* | For each trigger point, generate a sample narrative/talking point the user can rehearse. |
| **ATS Optimization** *(Planned)* | Identify missing industry keywords and formatting issues that automated tracking systems flag. |

### Required AI Skills

| Skill | What It Means |
|-------|---------------|
| **Information Extraction** | Parse rambling, unstructured user input and isolate the core achievement. |
| **Brevity Enforcement** | Cap bullet points to a strict word count (~20 words) for ATS compatibility and human readability. |
| **Vocabulary Enhancement** | Swap weak verbs for **Impact Verbs** (e.g., _managed_ → _orchestrated_, _helped_ → _facilitated_, _fixed_ → _remediated_). |
| **Contextual Chat** | Maintain multi-turn conversations with full resume analysis context to answer specific user questions. |

### Inputs & Outputs

| Direction | Data |
|-----------|------|
| **Input** | Raw resume text, parsed `workExperiences[]`, `projects[]` from `IUserService.getResume()` |
| **Output** | `ResumeAnalysis` (bullet analyses, trigger points, overall score), `CandidateProfile` (strengths, story readiness), cached analysis via `IUserService.saveResumeAnalysis()` |

### Acceptance Criteria

- [x] Agent analyzes all bullets and produces impact scores (1-10)
- [x] Agent identifies and flags weak bullets (no metrics, passive voice, vague impact)
- [x] Agent suggests rewritten bullets with improved verbs and metrics
- [x] Agent detects trigger points recruiters would probe
- [x] Agent compiles a `CandidateProfile` that is persisted and accessible to Agent 2
- [x] Chat sidebar provides contextual Q&A based on analysis results
- [x] Analysis is cached and loads instantly on repeat visits
- [x] Reanalyze button allows fresh analysis after resume updates
- [x] Dashboard widget displays gamified score and CTA
- [ ] User can review against a specific job description (tailored review)
- [ ] Agent generates talking points for each trigger point (gap coaching)
- [ ] User can accept, reject, or edit each bullet suggestion inline
- [ ] Agent enforces ≤20-word limit per bullet and flags violations
- [ ] XYZ quantification prompts appear when metrics are missing
- [ ] ATS keyword matching against a target role
- [ ] Score history tracked over time with comparison view

---

## Agent 2: The Narrative Coach

**Persona**: A behavioral interview coach who drills frameworks relentlessly.  
**Trigger**: User navigates to a Core Story card or the Interview Response Builder.

### Core Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Framework Enforcement** | Guide the user through **STAR** (Situation-Task-Action-Result), with strict time/length proportions: 20% Situation, 10% Task, **60% Action**, 10% Result. Advanced roles may use SHARE or SPSIL. |
| **Detail & Depth Probing** | When the Action phase is thin, probe with investigative follow-ups: _"You said you 'fixed the bug' — what diagnostic tools did you use? How did you isolate the root cause?"_ |
| **Emotional Arc Construction** | Ensure every story has a clear narrative arc: stakes/obstacle → personal intervention → impactful resolution → lesson learned. |
| **Content Matrix Building** | Help the user build a **10-story Content Matrix** — one polished story per Core Competency category — by mapping trigger points from the Architect to the existing 10 behavioral categories. |

### Required AI Skills

| Skill | What It Means |
|-------|---------------|
| **Proportion Analysis** | Measure the length of each STAR section and flag imbalances (e.g., Situation too long, Action too short). Render a visual proportion bar. |
| **Red Flag Detection** | Scan for: the **"We" trap** (using "we" instead of "I" in Action), vague results ("it went well"), badmouthing employers, or missing lessons learned. |
| **Pattern Mapping** | Help the user **pivot** one core story to answer multiple behavioral prompts. E.g., a Failure story can also answer "Tell me about a time you adapted" or "...received negative feedback." |

### Inputs & Outputs

| Direction | Data |
|-----------|------|
| **Input** | `CandidateProfile` from Agent 1, existing `Story[]` from `IUserService.getStories()`, `coreStoryMatches[]` from resume parsing |
| **Output** | Polished STAR narratives saved via `IUserService.updateStory()`, a populated **Content Matrix** (10 stories × N question mappings), proportion/quality scores per story |

### Acceptance Criteria

- [ ] Agent walks user through STAR section-by-section with inline guidance
- [ ] Visual proportion bar shows section length ratios in real time
- [ ] Agent flags Red Flags with inline warnings and suggested rewrites
- [ ] Agent probes for depth when the Action section is below 50% of total length
- [ ] Content Matrix dashboard shows which of the 10 categories have polished stories
- [ ] Agent suggests which questions each story can answer (pattern mapping)
- [ ] User can draft a story from an AI suggestion or from scratch
- [ ] Stories are persisted to `IUserService` with quality metadata (proportion scores, flag count)

---

## Agent 3: The Mock Interview Simulator

**Persona**: A realistic interviewer who adapts difficulty dynamically.  
**Trigger**: User enters Practice Mode from the Interview Prep page.

### Core Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Adaptive Questioning** | Start with the user's weakest stories (lowest quality scores or empty categories) and escalate difficulty based on response quality. |
| **Real-Time Feedback** | After each response, provide structured feedback: STAR adherence score, proportion analysis, red flag count, and specific improvement suggestions. |
| **Follow-Up Drilling** | Simulate a real interviewer's follow-ups: _"That's interesting — can you tell me more about how you measured success?"_ or _"What would you do differently next time?"_ |
| **Session Summary** | At the end of a mock session, generate a performance report: strengths, weaknesses, stories that need more work, and overall readiness score. |

### Required AI Skills

| Skill | What It Means |
|-------|---------------|
| **Difficulty Calibration** | Analyze user response quality in real time and adjust follow-up intensity. Novice users get gentler coaching; advanced users get curveball follow-ups. |
| **STAR Scoring** | Score each response against the STAR framework (completeness, proportions, specificity, impact). |
| **Session Analytics** | Track response times, confidence patterns, and improvement over multiple sessions. |

### Inputs & Outputs

| Direction | Data |
|-----------|------|
| **Input** | Content Matrix from Agent 2, `InterviewResponse[]` from `IUserService.getInterviewResponses()`, user's target role from `UserProfile` |
| **Output** | Session transcripts, per-response STAR scores, overall readiness score, improvement recommendations, `isPracticed` flags updated on `InterviewResponse` records |

### Acceptance Criteria

- [ ] User can start a timed mock interview session (configurable: 3, 5, or 10 questions)
- [ ] Questions are selected adaptively based on story readiness and past performance
- [ ] User can respond via text input (voice input deferred to future)
- [ ] Real-time STAR adherence feedback appears after each response
- [ ] Follow-up questions drill into weak areas of the response
- [ ] Session summary report is generated and saved
- [ ] Readiness score is displayed on the Dashboard
- [ ] Practice history is viewable with trend charts

---

## Agent Handoff Protocol

The agents share data through the existing service layer, not through direct coupling:

```mermaid
sequenceDiagram
    participant U as User
    participant A1 as Resume Architect
    participant DB as Service Layer
    participant A2 as Narrative Coach
    participant A3 as Mock Simulator

    U->>A1: Upload / edit resume
    A1->>DB: Save refined bullets + CandidateProfile
    U->>A2: Open a Core Story card
    A2->>DB: Read CandidateProfile + Stories
    A2->>DB: Save polished STAR story + quality scores
    U->>A3: Start mock session
    A3->>DB: Read Content Matrix + InterviewResponses
    A3->>DB: Save session results + readiness score
```

> [!NOTE]
> Each agent reads and writes through `IUserService` and `IAgentService`. No agent calls another agent directly. The user decides when to move between agents — there is no forced linear flow.

---

## New Data Models

The following types will be added to `src/types.ts`:

```typescript
/** Output of the Resume Architect — persisted on the user profile */
interface CandidateProfile {
  triggerPoints: TriggerPoint[];
  competencyTags: string[];
  updatedAt: string;
}

interface TriggerPoint {
  experienceId: string;        // Links to a WorkExperience
  originalBullet: string;
  refinedBullet: string;
  impactVerbs: string[];
  quantified: boolean;         // Has XYZ metrics
  framework: 'PSR' | 'CAR';
}

/** Quality metadata attached to each Story */
interface StoryQuality {
  proportions: {
    situation: number;  // percentage, should be ~20%
    task: number;       // percentage, should be ~10%
    action: number;     // percentage, should be ~60%
    result: number;     // percentage, should be ~10%
  };
  redFlags: RedFlag[];
  overallScore: number;          // 0–100
  questionMappings: string[];    // behavioral prompts this story can answer
}

interface RedFlag {
  type: 'we_trap' | 'vague_result' | 'badmouthing' | 'missing_lesson' | 'passive_voice';
  excerpt: string;
  suggestion: string;
}

/** Mock interview session record */
interface MockSession {
  id: string;
  userId: string;
  targetRole: string;
  questionCount: number;
  responses: MockResponse[];
  readinessScore: number;       // 0–100
  strengths: string[];
  weaknesses: string[];
  startedAt: string;
  completedAt: string;
}

interface MockResponse {
  questionId: string;
  question: string;
  userResponse: string;
  starScore: StoryQuality['proportions'];
  redFlags: RedFlag[];
  feedback: string;
  followUps: string[];
  responseTimeSeconds: number;
}
```

## Service Layer Changes

### `IAgentService` Extensions

```typescript
// New methods on IAgentService
refineResumeBullets(experienceId: string, bullets: string[]): Promise<TriggerPoint[]>;
generateCandidateProfile(resumeData: Resume): Promise<CandidateProfile>;
coachStory(storyId: string, section: 'situation' | 'task' | 'action' | 'result'): Promise<CoachingResponse>;
analyzeStoryQuality(story: Story): Promise<StoryQuality>;
startMockSession(config: MockSessionConfig): Promise<MockSession>;
submitMockResponse(sessionId: string, response: string): Promise<MockResponse>;
endMockSession(sessionId: string): Promise<MockSession>;
```

### `IUserService` Extensions

```typescript
// New methods on IUserService
getCandidateProfile(): Promise<CandidateProfile | null>;
saveCandidateProfile(profile: CandidateProfile): Promise<CandidateProfile>;
getMockSessions(): Promise<MockSession[]>;
getMockSession(id: string): Promise<MockSession | null>;
saveMockSession(session: MockSession): Promise<MockSession>;
```

---

## Relationship to Existing Features

| Existing Feature | Relationship |
|------------------|-------------|
| [Resume Parsing & Import](./user-onboarding.md) | Agent 1 consumes `getResume()` output and refines it. Parsing remains unchanged. |
| [Behavioral Core Stories](./story-management.md) | Agent 2 works directly within the 10-category matrix. Stories are the same data model, enhanced with `StoryQuality` metadata. |
| [Interview Response Builder](./interview-response-builder.md) | Agent 3 consumes responses and maps them to mock sessions. The builder becomes the "composing" step before simulation. |
| [AI Assistant](./ai-assistant.md) | **Superseded.** Generic capabilities (summarize, rewrite, etc.) may survive as inline editor tools, but are no longer the primary AI feature. |

---

## Implementation Phases

### Phase 1: Resume Architect — ✅ Complete
- [x] Define `ResumeAnalysis`, `BulletAnalysis`, `TriggerPoint`, `CandidateProfile` types
- [x] Implement `analyzeResume()` and `chatWithResumeContext()` on the backend
- [x] Build standalone Resume Review page (`/resume-review`) with 3-step tab flow
- [x] Build contextual chat sidebar (`ResumeChat.tsx`)
- [x] Implement analysis caching (save/load `ResumeAnalysis` to disk)
- [x] Auto-save `CandidateProfile` after analysis
- [x] Build Dashboard Resume Score widget with circular gauge and CTA
- [x] Add navigation from Profile, Dashboard, and TopNavBar

### Phase 1.5: Resume Architect Enhancements — 🔜 Next
- [ ] Tailored review: accept job description input and score against it
- [ ] Gap story coaching: generate talking points per trigger point
- [ ] Inline bullet editing: accept/reject/edit suggestions directly
- [ ] ATS keyword check against target role
- [ ] Score history tracking and comparison view

### Phase 2: Narrative Coach
- [ ] Define `StoryQuality` and `RedFlag` types
- [ ] Implement `coachStory()` and `analyzeStoryQuality()` on the backend
- [ ] Build proportion visualization component
- [ ] Integrate coaching flow into Core Stories page
- [ ] Implement pattern mapping (story → questions)

### Phase 3: Mock Interview Simulator
- [ ] Define `MockSession` and `MockResponse` types
- [ ] Implement mock session API endpoints
- [ ] Build Practice Mode UI with timer and adaptive questioning
- [ ] Implement session summary and readiness scoring
- [ ] Add readiness widget to Dashboard

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Resume bullets refined per user | ≥ 10 |
| Content Matrix completion (stories drafted) | ≥ 7 of 10 categories |
| Story quality score improvement after coaching | ≥ 20-point increase |
| Mock sessions completed per user | ≥ 3 |
| Readiness score improvement over sessions | Positive trend across 3+ sessions |
| User satisfaction with AI coaching | ≥ 4.0 / 5.0 |

## Design References

- See: [story-management.md](./story-management.md) — 10 Core Competency categories
- See: [interview-response-builder.md](./interview-response-builder.md) — Question bank and response data model
- See: [user-onboarding.md](./user-onboarding.md) — Resume parsing pipeline
- See: `docs/FRONTEND.md` — UI patterns for agent interaction views
- See: `ARCHITECTURE.md` — Service abstraction patterns
