# Feature Purposes

**Version**: 2.0
**Last Updated**: 2026-04-14

This document defines the purpose and user story for each feature. Technical details belong in per-feature specs. This document answers: **why does this feature exist and what does it do for the user?**

---

## 1. Onboarding

### Purpose
Get users from zero to having a profile, resume, and initial AI-suggested story matches so the app has enough context to personalize everything else.

### User Story
"As a new user, I want to quickly tell the app who I am and what my background is, so it can give me relevant suggestions instead of generic advice."

### What It Collects
1. **Identity**: Name, target role, target company
2. **Pain assessment**: 3-question Likert survey identifying which interview prep challenges the user struggles with most (curveball questions, feedback gaps, delivery pressure)
3. **Resume data**: Work experience, education, skills - entered manually or parsed from PDF via Gemini
4. **Initial story matches**: AI maps the user's experiences to the 10 core story categories

### What It Gives the App
- `UserProfile` (name, role, company, survey responses) - personalizes the dashboard and coaching
- `Resume` (experiences, skills, education, raw text) - feeds the Resume Architect and story suggestions
- `CoreStoryMatch[]` (category -> experience mapping) - pre-populates the Core Stories grid

### Current State: Built
5-step wizard: Welcome -> Survey -> Resume Upload -> Core Story Match -> Completion. Fully functional. `SurveyStep` is the key differentiator - it drives which CTA the dashboard highlights first.

---

## 2. Dashboard

### Purpose
Act as a guided roadmap that shows users where they are in their interview prep journey and what to do next. Every element should answer: "what should I work on right now?"

### User Story
"As a user returning to the app, I want to immediately see what I should work on next, so I don't waste time figuring out where I left off."

### The Roadmap Stages
1. **Resume Foundation** - Upload and optimize your resume. CTA links to Resume Architect.
2. **Core Stories** - Build out your 10 behavioral stories. CTA links to Core Stories page.
3. **Company Prep** - Create company-specific cheat sheets and notes. CTA links to Documents.
4. **Practice** - Use flashcards, simulator, or mock AI interview. CTA links to Practice Tools.

The dashboard should highlight the current stage based on completion state. If no resume exists, stage 1 is prominent. If resume is scored but stories are incomplete, stage 2 is prominent. The onboarding survey responses weight which stage gets the most visual emphasis.

### What Exists Now
- Resume Score widget (circular SVG gauge, fetched from candidate profile/analysis)
- Document grid with search/sort/grid-list toggle
- Hardcoded "Interview Progress" chart (fake data)
- Recently opened documents
- Title says "My Documents" - treats the dashboard as a document manager, not a roadmap

### What Needs to Change
- Replace "My Documents" with a roadmap layout showing the 4 stages
- Each stage shows completion state and a call-to-action button
- Resume score widget moves into the Resume Foundation stage
- Hardcoded progress chart removed or replaced with real data
- Survey responses from onboarding influence which CTA is most prominent

### Current State: Needs Rewrite

---

## 3. Resume Architect

### Purpose
Help users analyze and improve their resume through AI-powered coaching. The agent identifies weak bullets, finds trigger points recruiters will ask about, checks ATS compatibility, and suggests rewrites the user can accept or reject.

### User Story
"As a job seeker, I want to know exactly what's wrong with my resume and get specific suggestions for fixing it, so I can improve my chances of getting past ATS filters and impressing recruiters."

### What It Does
1. **Bullet Analysis** - Every resume bullet gets an impact score (1-10) and issue tags (weak verb, no metrics, passive voice, bad structure, too brief). Each bullet gets a suggested rewrite.
2. **Trigger Points** - Identifies aspects of the resume that interviewers will ask about. User rates their comfort level for each (have story / comfortable / not comfortable).
3. **ATS Compatibility** - Algorithmic checks on PDF formatting (single-column, fonts, headings, graphics, chronology). Scores 0-100 with pass/warning/fail per check.
4. **AI Coaching Chat** - A Gemini-powered agent with access to tools. It reads the user's resume, proposes specific edits, tracks goals and todos, and saves resume version snapshots. Users accept, reject, or modify proposed changes.
5. **Coaching Workspace** - Sidebar showing goals (with progress), todos (with status), and version history.

### The AI Agent
It's a single Gemini model with a system prompt and tools. NOT a multi-agent pipeline. The tools let it:
- Read resume data, bullet analyses, trigger points, stories
- Search across all user data by keyword
- Create goals, todos, and track progress
- Propose resume changes with alternatives
- Update user preferences (target role, writing style)
- Save resume version checkpoints
- Store and retrieve session memory

### Key Files
- `src/components/ResumeReviewPage.tsx` (680 lines) - 4-tab UI
- `src/components/profile/ResumeChat.tsx` (923 lines) - AI chat with streaming and change proposals
- `src/components/profile/CoachingWorkspaceSidebar.tsx` (386 lines) - Goals, todos, versions
- `electron/agent/` - Runtime, tools, memory, coaching store, prompts, knowledge assembler

### Current State: Built, Actively Improving
The most complete feature in the app. Core functionality works end-to-end. The coaching workspace (goals, todos, staged changes, versions) is fully built but was previously undocumented.

---

## 4. Core Stories

### Purpose
Help users build a library of 10 structured STAR-method stories, one for each core behavioral interview category. These 10 stories are designed to cover ~90% of behavioral questions through adaptation.

### User Story
"As an interview candidate, I want to have a ready-made story for every common behavioral category, so I can adapt my answer to whatever question they throw at me instead of freezing up."

### The 10 Core Categories
1. Conflict - Disagreement with a peer/supervisor
2. Failure - A genuine mistake and what was learned
3. Leadership - Taking the lead, formal title or not
4. Adaptability - Rapidly shifting priorities
5. Tight Deadline - Overwhelmed and prioritizing
6. Difficult Customer - Handling a difficult stakeholder
7. Data-Driven Decision - Choice with incomplete data
8. Above and Beyond - Exceeding expectations
9. Persuasion - Convincing a skeptic
10. Proudest Accomplishment - The "Hero Story"

### What It Does
- Grid matrix showing all 10 categories with status badges (drafted, AI suggestion, empty)
- Side panel with STAR editor (Situation, Task, Action, Result)
- AI suggests which of the user's experiences maps to each category (from onboarding)
- Tags for cross-referencing stories

### What Needs Redesign
- How stories connect to practice tools (currently disconnected)
- Better editing and review flow
- Story completeness scoring - which categories are well-covered vs. weak
- Integration with the behavioral interview agent (prompt exists but no UI)

### Current State: Built, Needs Redesign

---

## 5. Prep Sheets

### Purpose
Let users create structured, company-specific interview cheat sheets that consolidate company context, role alignment, and prepared stories. Prep sheets are designed for fast recall and consistency across interviews.

### User Story
"As a job seeker preparing for a specific company and role, I want to create a structured cheat sheet that consolidates everything I need to know, so I can review it quickly before my interview."

### What It Does
A prep sheet contains **11 modular sections** that users can include or exclude:
1. **Company Snapshot** — Company name, industry, product, values, mission, interview format (autofilled from scraper)
2. **Role Breakdown** — Role title, responsibilities, required skills, success indicators (parsed from JD)
3. **Story Bank** — References to existing STAR stories from Core Stories feature (not duplicates)
4. **Question Mapping** — Common questions linked to stories (autofilled from scraper)
5. **Company Alignment** — Which company values map to which stories
6. **Strengths & Weaknesses** — Prepared answers with examples
7. **Key Talking Points** — "Why this company?", "Tell me about yourself"
8. **Questions for Interviewer** — Role, team, company questions
9. **Technical Prep** — Technical concepts, system design, coding questions
10. **Logistics** — Interview rounds, interviewer names, notes
11. **Post-Interview Reflection** — What went well, what to improve

### Scraper Integration
Prep Sheets consume data from the **Company Question Ingestion** pipeline:
- Company values/mission → Company Snapshot section
- Interview questions → Question Mapping section
- Technical questions → Technical Prep section
- Job posting details → Role Breakdown section

Data is bundled with the app for top companies and can be refreshed on demand.

### Creation Flow
Clicking "Create Prep Sheet" opens a modal wizard:
1. **Company** — Search company name; if scraped data exists, autofill preview
2. **Role** — Paste job description; AI parses role title, skills, responsibilities
3. **Sections** — Toggle which sections to include (behavioral vs technical)
4. **Create** — Sheet created with autofilled data; user edits remaining fields

### What Needs to Change
- Replace `Document` type with `PrepSheet` type (11 structured sections)
- Replace flat Q&A editor with section-based editors
- Replace creation flow with modal wizard
- Integrate scraped data for autofill
- Connect Story Bank to existing Core Stories

### Current State: Planned (replacing Documents)

---

## 6. Practice Tools

### Purpose
Give users multiple ways to practice delivering their interview responses, from quick review to realistic simulation.

### User Story
"As a candidate with my stories prepared, I want to practice delivering them under different levels of pressure, so I'm comfortable and natural in the actual interview."

### Planned Modalities (all TBD)
1. **Flashcards** - Quick review. See a behavioral question, flip to see which story to use and key points to hit.
2. **Interview Simulator** - See a question, record your answer (text or video), review your response against your prepared story.
3. **AI Mock Interview** - Voice-based mock interview with AI agent that asks follow-up questions.

### What Exists
- `InterviewResponse` type and CRUD methods in `IUserService` (no UI)
- Voice interview infrastructure: types, service interface, IPC handlers, controller, session store (no real voice provider, no UI)
- `behavioral-assistant` prompt in the agent runtime (exists but no UI to access it)
- All infrastructure is deprioritized until the core features are solid

### Current State: Planned
Infrastructure exists for voice interviews but has no UI. No practice tool UI exists at all. This is the final stage of the roadmap - only build after resume, stories, and documents are solid.
