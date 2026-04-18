# Feature: Prep Sheets

**Status**: In Progress (replacing Documents feature)
**Last Updated**: 2026-04-17
**Depends On**: Company Question Ingestion (scraper pipeline)

## User Story

As a job seeker preparing for a specific company and role, I want to create a structured cheat sheet that consolidates company context, role alignment, and my prepared stories so I can review everything I need before an interview in one place.

## Purpose

Prep Sheets replace the generic "Documents" feature with structured, company-specific interview preparation templates. Each prep sheet is designed for fast recall and consistency across interviews.

The cheat sheet standardizes three things:
1. **Company context** — what the company does, their values, interview format
2. **Role alignment** — what the job requires, what success looks like
3. **Your prepared stories** — which STAR stories map to which questions

This connects directly to the **Company Question Ingestion** scraper pipeline, which provides:
- Company values and mission (from careers pages)
- Common interview questions (from Glassdoor, LeetCode, Reddit)
- Role-specific requirements (from job postings)

## The Cheat Sheet Template

A prep sheet contains **10 optional sections**. Users choose which sections to include based on whether they're preparing for **behavioral** or **technical** interviews (or both).

### Section 1: Company Snapshot (Core)

Basic context you review before every interview.

| Field | Source |
|-------|--------|
| Company name | User input |
| Industry / product | Scraper (careers page) or user input |
| Business model | Scraper or user input |
| Recent news | User input (optional) |
| Competitors | User input (optional) |
| Company values / principles | Scraper (careers page) |
| Interview format | Scraper (Glassdoor) or user input |

### Section 2: Role Breakdown (Core)

Maps the job to what you need to demonstrate.

| Field | Source |
|-------|--------|
| Role title | User input (from JD paste) |
| Team / org | User input (from JD paste) |
| Key responsibilities | Scraper (careers job postings) or JD parsing |
| Top 3–5 skills required | JD parsing (AI extracts) |
| What success looks like (first 6–12 months) | JD parsing or user input |
| Hiring signals | User input |

### Section 3: Story Bank (Behavioral)

Reusable STAR stories. Each story should be tagged.

| Field | Source |
|-------|--------|
| Story title | From existing `Story` records |
| Tags (leadership, conflict, failure, etc.) | From existing `Story` records |
| Situation (1–2 lines) | From existing `Story` records |
| Task | From existing `Story` records |
| Action (what *you* did) | From existing `Story` records |
| Result (quantified) | From existing `Story` records |
| Key takeaway | User adds per-sheet |
| Follow-up angles | User adds per-sheet |

**Note**: Stories come from the Core Stories feature. The prep sheet *references* them, not duplicates them. Users maintain ~8–12 strong stories that can be reused across sheets.

### Section 4: Question Mapping (Behavioral)

Pre-map common behavioral questions to stories.

| Field | Source |
|-------|--------|
| Question text | Scraper (Glassdoor, LeetCode, Reddit) or user input |
| Linked story ID(s) | User selects from Story Bank |
| Notes / key points | User input |

Example mappings:
- "Tell me about a time you failed" → Story X
- "Handled conflict" → Story Y
- "Leadership example" → Story Z

### Section 5: Company-Specific Alignment (Behavioral)

Customize per company without rewriting stories.

| Field | Source |
|-------|--------|
| Which values map to which stories | User input (e.g., "Customer obsession" → Story A) |
| Which experiences are most relevant | User input |
| Gaps to frame carefully | User input |

### Section 6: Strengths & Weaknesses (Behavioral)

| Field | Source |
|-------|--------|
| Top 3 strengths | User input with supporting examples |
| 1–2 weaknesses | User input with mitigation strategy |

### Section 7: Key Talking Points (Core)

Short, repeatable positioning.

| Field | Source |
|-------|--------|
| "Why this company?" | User input |
| "Why this role?" | User input |
| "Tell me about yourself" (30–60 sec) | User input |
| Career narrative (1–2 min) | User input |

### Section 8: Questions for Interviewer (Core)

| Field | Source |
|-------|--------|
| Role-specific questions | User input |
| Team/process questions | User input |
| Company direction questions | User input |

### Section 9: Technical Prep (Technical)

For technical interviews, system design, coding rounds.

| Field | Source |
|-------|--------|
| Key technical concepts to review | User input |
| System design patterns | User input |
| Common technical questions | Scraper (LeetCode) |
| Past project deep-dive notes | User input |

### Section 10: Logistics & Notes (Core)

| Field | Source |
|-------|--------|
| Interview dates / rounds | User input |
| Interviewer names + roles | User input |
| Notes from each round | User input |
| Follow-ups / thank-you notes | User input |

### Section 11: Post-Interview Reflection (Core)

| Field | Source |
|-------|--------|
| What went well | User input |
| What didn't | User input |
| Questions you struggled with | User input |
| Stories to refine or add | User input |

## Creation Wizard Flow

When a user clicks "Create New Prep Sheet", a modal wizard walks them through:

1. **Company Selection**
   - Search/input company name
   - If company exists in scraped data bundle, auto-populate Company Snapshot fields
   - If not, fields remain empty for manual input
   - Option: "Refresh data" to trigger scraper for fresh data

2. **Role Setup**
   - Paste job description text
   - AI parses JD to extract: role title, key responsibilities, required skills, success indicators
   - Auto-populate Role Breakdown fields
   - User can edit/override

3. **Section Selection**
   - Toggle which sections to include:
     - Behavioral track: Story Bank, Question Mapping, Company Alignment, Strengths/Weaknesses
     - Technical track: Technical Prep
     - Core sections: Company Snapshot, Role Breakdown, Key Talking Points, Questions for Interviewer, Logistics, Reflection
   - Default: all sections included

4. **Autofill from Sources**
   - Company Snapshot: populated from scraped data if available
   - Question Mapping: populated with common questions from scraper (Glassdoor, LeetCode, Reddit)
   - Technical Prep: populated with common technical questions if role is technical
   - User can review and edit before finalizing

5. **Create Sheet**
   - Sheet is created with populated fields
   - User lands in the editor to fill remaining fields

## Downstream Consumers

The **Company Question Ingestion** scraper pipeline (`tools/question-ingestion/`) feeds this feature:

| Scraper Output | Prep Sheet Section |
|----------------|-------------------|
| Company values/mission | Company Snapshot |
| Interview format notes | Company Snapshot |
| Common interview questions | Question Mapping, Technical Prep |
| Role-specific requirements | Role Breakdown |
| Job posting details | Role Breakdown |

See `docs/features/company-question-ingestion/product-spec.md` for scraper details.

## Data Model

```typescript
interface PrepSheet {
  id: string;
  userId: string;
  companyName: string;
  
  // Core sections (always present if selected)
  companySnapshot?: CompanySnapshotSection;
  roleBreakdown?: RoleBreakdownSection;
  keyTalkingPoints?: KeyTalkingPointsSection;
  questionsForInterviewer?: QuestionsForInterviewerSection;
  logistics?: LogisticsSection;
  postInterviewReflection?: PostInterviewReflectionSection;
  
  // Behavioral sections
  storyBank?: StoryBankSection;       // References existing Story records
  questionMapping?: QuestionMappingSection;
  companyAlignment?: CompanyAlignmentSection;
  strengthsWeaknesses?: StrengthsWeaknessesSection;
  
  // Technical sections
  technicalPrep?: TechnicalPrepSection;
  
  // Metadata
  includedSections: PrepSheetSectionId[];
  templateType: 'behavioral' | 'technical' | 'full';
  createdAt: string;
  updatedAt: string;
  lastModified: string;
}

type PrepSheetSectionId = 
  | 'company-snapshot'
  | 'role-breakdown'
  | 'story-bank'
  | 'question-mapping'
  | 'company-alignment'
  | 'strengths-weaknesses'
  | 'key-talking-points'
  | 'questions-for-interviewer'
  | 'technical-prep'
  | 'logistics'
  | 'post-interview-reflection';
```

## Acceptance Criteria

- [ ] Prep sheet creation wizard exists (modal, not full-page)
- [ ] Company selection with scraped data autofill works
- [ ] JD paste parsing extracts role title, responsibilities, skills
- [ ] Users can toggle which sections to include
- [ ] Scraper data populates Company Snapshot and Question Mapping sections
- [ ] Story Bank references existing stories (not duplicates)
- [ ] Question Mapping links questions to stories
- [ ] All 11 section editors exist
- [ ] Sheet list view shows company name, role, included sections
- [ ] Old `Document` type deprecated, migrated to `PrepSheet`

## Design Principles

1. **One master story bank** — Stories live in Core Stories feature. Prep sheets reference them.
2. **One page per company** — Each prep sheet is company-specific but references shared stories.
3. **Scraped data is a starting point** — Auto-populate but user can override everything.
4. **Sections are modular** — User picks what they need; don't overwhelm with everything.

## Success Metrics

- Number of prep sheets created per user
- % of sheets that include both behavioral and technical sections
- % of Company Snapshot fields auto-populated from scraper data
- % of Question Mapping entries linked to stories
- Time from "Create" to first complete sheet