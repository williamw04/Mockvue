# Design: Prep Sheets Architecture

**Status**: Draft
**Author**: OpenCode
**Last Updated**: 2026-04-17

## Problem Statement

The current `Document` type is a flat Q&A list with no structure, no connection to company research, no integration with stories, and no scraper-fed autofill. Users have to manually create everything from scratch.

We need a structured data model that:
1. Represents a company-specific interview cheat sheet with 11 modular sections
2. Integrates with scraped company data (values, questions, job postings)
3. References existing stories instead of duplicating them
4. Supports a creation wizard that autofills from multiple sources

## Decision: Replace Document with PrepSheet

### Type System Changes

The `Document` type (`src/types.ts`) will be deprecated and replaced with `PrepSheet`.

```typescript
// DEPRECATED: Document type
export interface Document {
  id: string;
  userId: string;
  title: string;
  description?: string;
  questions: DocumentQuestion[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastModified: string;
}

// NEW: PrepSheet type
export interface PrepSheet {
  id: string;
  userId: string;
  companyName: string;
  roleTitle?: string;
  
  companySnapshot?: CompanySnapshotSection;
  roleBreakdown?: RoleBreakdownSection;
  storyBank?: StoryBankSection;
  questionMapping?: QuestionMappingSection;
  companyAlignment?: CompanyAlignmentSection;
  strengthsWeaknesses?: StrengthsWeaknessesSection;
  keyTalkingPoints?: KeyTalkingPointsSection;
  questionsForInterviewer?: QuestionsForInterviewerSection;
  technicalPrep?: TechnicalPrepSection;
  logistics?: LogisticsSection;
  postInterviewReflection?: PostInterviewReflectionSection;
  
  includedSections: PrepSheetSectionId[];
  templateType: 'behavioral' | 'technical' | 'full';
  
  createdAt: string;
  updatedAt: string;
  lastModified: string;
}
```

### Section Types

Each section has its own type definition:

```typescript
export interface CompanySnapshotSection {
  companyName: string;
  industry?: string;
  product?: string;
  businessModel?: string;
  recentNews?: string;
  competitors?: string[];
  companyValues?: string[];
  mission?: string;
  interviewFormat?: string;
  dataSource: 'scraped' | 'manual' | 'mixed';
}

export interface RoleBreakdownSection {
  roleTitle: string;
  teamOrg?: string;
  keyResponsibilities: string[];
  topSkills: string[];
  successLooksLike?: string;
  hiringSignals?: string[];
  dataSource: 'jd-parsed' | 'manual' | 'mixed';
}

export interface StoryBankSection {
  // References, not duplicates
  linkedStoryIds: string[];
  perSheetNotes: Record<string, {
    keyTakeaway?: string;
    followUpAngles?: string[];
  }>;
}

export interface QuestionMappingSection {
  mappings: QuestionMappingEntry[];
}

export interface QuestionMappingEntry {
  id: string;
  questionText: string;
  linkedStoryIds: string[];
  notes?: string;
  source: 'scraped' | 'manual';
}

export interface CompanyAlignmentSection {
  valueStoryMappings: ValueStoryMapping[];
  relevantExperiences?: string[];
  gapsToFrame?: string[];
}

export interface ValueStoryMapping {
  companyValue: string;
  linkedStoryId: string;
  notes?: string;
}

export interface StrengthsWeaknessesSection {
  strengths: StrengthEntry[];
  weaknesses: WeaknessEntry[];
}

export interface StrengthEntry {
  strength: string;
  supportingExample?: string;
}

export interface WeaknessEntry {
  weakness: string;
  mitigationStrategy?: string;
}

export interface KeyTalkingPointsSection {
  whyCompany?: string;
  whyRole?: string;
  tellMeAboutYourselfShort?: string;
  careerNarrative?: string;
}

export interface QuestionsForInterviewerSection {
  roleQuestions: string[];
  teamQuestions: string[];
  companyQuestions: string[];
}

export interface TechnicalPrepSection {
  keyConcepts?: string[];
  systemDesignPatterns?: string[];
  commonTechnicalQuestions: QuestionMappingEntry[];
  projectDeepDive?: string[];
}

export interface LogisticsSection {
  interviewRounds: InterviewRound[];
  notesPerRound?: Record<string, string>;
  thankYouNotes?: string;
}

export interface InterviewRound {
  id: string;
  date?: string;
  type: string;
  interviewerName?: string;
  interviewerRole?: string;
  notes?: string;
}

export interface PostInterviewReflectionSection {
  wentWell?: string[];
  didntGoWell?: string[];
  struggledQuestions?: string[];
  storiesToRefine?: string[];
}
```

### Service Interface Changes

`IDocumentService` becomes `IPrepSheetService`:

```typescript
export interface IPrepSheetService {
  getPrepSheets(): Promise<PrepSheet[]>;
  getPrepSheet(id: string): Promise<PrepSheet | null>;
  createPrepSheet(input: CreatePrepSheetInput): Promise<PrepSheet>;
  updatePrepSheet(id: string, updates: Partial<PrepSheet>): Promise<PrepSheet>;
  deletePrepSheet(id: string): Promise<void>;
  
  // Scraper integration
  getScrapedCompanyData(companyName: string): Promise<ScrapedCompanyData | null>;
  refreshScrapedData(companyName: string): Promise<ScrapedCompanyData>;
  
  // JD parsing
  parseJobDescription(jdText: string): Promise<ParsedJobDescription>;
}

export interface CreatePrepSheetInput {
  companyName: string;
  roleTitle?: string;
  jobDescription?: string;
  includedSections: PrepSheetSectionId[];
  templateType: 'behavioral' | 'technical' | 'full';
  useScrapedData?: boolean;
}

export interface ScrapedCompanyData {
  companyName: string;
  values?: string[];
  mission?: string;
  interviewQuestions?: string[];
  interviewFormat?: string;
  technicalQuestions?: string[];
  lastScrapedAt: string;
}

export interface ParsedJobDescription {
  roleTitle: string;
  responsibilities: string[];
  requiredSkills: string[];
  successIndicators?: string[];
  teamOrg?: string;
}
```

## Scraper Integration Architecture

### Data Flow

```
[Scraper Pipeline]                [Mockvue App]
tools/question-ingestion/         src/services/
     |                                 |
     v                                 v
ingestion.db (SQLite)          scraped-data.json (bundled)
     |                                 |
     | [build script]                  |
     +------------------------->-------+
                                   |
                                   v
                          IPrepSheetService.getScrapedCompanyData()
                                   |
                                   v
                          Prep Sheet Creation Wizard autofill
```

### Bundled Data Strategy

1. **Scraper runs as dev tool** — Developers run `npm run scrape --company "Google"` to ingest data
2. **Build script exports to JSON** — Before app build, scraped data is exported from SQLite to a JSON bundle
3. **App ships with bundled data** — Top 50 companies have pre-scraped data included
4. **Refresh on demand** — Users can trigger a refresh for any company (calls scraper at runtime)

### Scraper Output Format

The `tools/question-ingestion/src/types.ts` already defines:
- `QuestionObservation` — individual scraped question with provenance
- `NormalizedQuestion` — deduplicated canonical question
- `QuestionCluster` — grouped similar questions

We need a new export format that groups by company:

```typescript
export interface ScrapedCompanyExport {
  companyName: string;
  observations: {
    values: string[];
    mission?: string;
    interviewQuestions: string[];
    technicalQuestions: string[];
    roleRequirements: string[];
  };
  provenance: {
    sources: string[];
    lastFetchedAt: string;
  };
}
```

### Scraper Adapter Mapping

| Adapter | What it provides | Prep Sheet Section |
|---------|------------------|-------------------|
| `careers.ts` | Company values, mission, culture, job postings | Company Snapshot, Role Breakdown |
| `glassdoor.ts` | Interview questions, format notes | Question Mapping, Company Snapshot |
| `leetcode.ts` | Technical/coding questions, OA questions | Technical Prep |
| `reddit.ts` | Behavioral questions, interview experiences | Question Mapping |

## Storage Strategy

### File Structure

```
electron/storage/
├── user-data/
│   └── {userId}/
│       ├── profile.json
│       ├── resume.json
│       ├── stories.json
│       ├── prep-sheets/
│       │   ├── {sheetId}.json
│       │   └── ...
│       └── ...
├── scraped-data/
│   ├── companies.json        # Bundled scraped data
│   ├── last-updated.json     # Timestamps per company
│   └── ...
```

### Prep Sheet File Format

Each prep sheet is stored as a JSON file with full section data:

```json
{
  "id": "sheet-123",
  "userId": "user-abc",
  "companyName": "Google",
  "roleTitle": "Software Engineer L4",
  "includedSections": [
    "company-snapshot",
    "role-breakdown",
    "story-bank",
    "question-mapping",
    "technical-prep",
    "key-talking-points",
    "logistics"
  ],
  "templateType": "full",
  "companySnapshot": {
    "companyName": "Google",
    "industry": "Technology",
    "product": "Search, Cloud, AI",
    "companyValues": [
      "Focus on the user",
      "Democracy of information",
      "You can be serious without a suit"
    ],
    "mission": "Organize the world's information...",
    "interviewFormat": "Phone screen + onsite (4-5 rounds)",
    "dataSource": "scraped"
  },
  "storyBank": {
    "linkedStoryIds": ["story-1", "story-3", "story-7"],
    "perSheetNotes": {
      "story-1": {
        "keyTakeaway": "Customer obsession example",
        "followUpAngles": ["What would you do differently?"]
      }
    }
  },
  "questionMapping": {
    "mappings": [
      {
        "id": "qm-1",
        "questionText": "Tell me about a time you failed",
        "linkedStoryIds": ["story-3"],
        "source": "scraped"
      }
    ]
  },
  "createdAt": "2026-04-17T10:00:00Z",
  "updatedAt": "2026-04-17T12:30:00Z",
  "lastModified": "2026-04-17T12:30:00Z"
}
```

## Creation Wizard UI Design

### Modal-Based Flow

The wizard opens as a modal overlay, not a full-page navigation.

```
[Dashboard] → Click "Create Prep Sheet" → [Modal Wizard]

Modal Steps:
┌─────────────────────────────────────────────┐
│ Step 1: Company                             │
│ ┌─────────────────────────────────────┐    │
│ │ Company name: [________________]     │    │
│ │                                     │    │
│ │ ✓ Data available (last scraped Apr 10)│  │
│ │   - Values: 5 entries               │    │
│ │   - Questions: 42 entries           │    │
│ │                                     │    │
│ │ [Refresh Data] (optional)           │    │
│ └─────────────────────────────────────┘    │
│                    [Next]                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Step 2: Role                                │
│ ┌─────────────────────────────────────┐    │
│ │ Paste job description here:         │    │
│ │ [_______________________________]   │    │
│ │ [_______________________________]   │    │
│ │                                     │    │
│ │ Parsed:                             │    │
│ │   Role: Software Engineer           │    │
│ │   Skills: Python, AWS, Kubernetes   │    │
│ │                                     │    │
│ │ [Edit parsed fields]                │    │
│ └─────────────────────────────────────┘    │
│                    [Next]                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Step 3: Sections                            │
│ ┌─────────────────────────────────────┐    │
│ │ Core (always included):             │    │
│ │   ✓ Company Snapshot                │    │
│ │   ✓ Role Breakdown                  │    │
│ │   ✓ Key Talking Points              │    │
│ │                                     │    │
│ │ Behavioral:                         │    │
│ │   ☑ Story Bank                      │    │
│ │   ☑ Question Mapping                │    │
│ │   ☑ Company Alignment               │    │
│ │   ☐ Strengths & Weaknesses          │    │
│ │                                     │    │
│ │ Technical:                          │    │
│ │   ☑ Technical Prep                  │    │
│ │                                     │    │
│ │ Logistics:                          │    │
│ │   ☑ Logistics & Notes               │    │
│ │   ☐ Post-Interview Reflection       │    │
│ └─────────────────────────────────────┘    │
│                [Create Sheet]               │
└─────────────────────────────────────────────┘
```

### Wizard State Management

```typescript
interface WizardState {
  step: 1 | 2 | 3;
  
  company: {
    name: string;
    scrapedData: ScrapedCompanyData | null;
    isRefreshing: boolean;
  };
  
  role: {
    jobDescription: string;
    parsed: ParsedJobDescription | null;
    isParsing: boolean;
  };
  
  sections: {
    included: PrepSheetSectionId[];
    templateType: 'behavioral' | 'technical' | 'full';
  };
}
```

## Editor UI Design

Each section has a dedicated editor component. The main prep sheet editor shows a tabbed or accordion interface.

```
[Prep Sheet Editor]
┌─────────────────────────────────────────────────┐
│ Google - Software Engineer L4                   │
│ Last modified: Apr 17, 2:30 PM                  │
├─────────────────────────────────────────────────┤
│ [Company] [Role] [Stories] [Questions] [Tech] ...│
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌── Company Snapshot ────────────────────────┐ │
│ │ Company: Google                             │ │
│ │ Industry: Technology                        │ │
│ │ Product: Search, Cloud, AI                  │ │
│ │                                             │ │
│ │ Company Values (5):                         │ │
│ │   • Focus on the user                       │ │
│ │   • Democracy of information                │ │
│ │   [Edit values]                             │ │
│ │                                             │ │
│ │ Interview Format:                           │ │
│ │ Phone screen + onsite (4-5 rounds)          │ │
│ │                                             │ │
│ │ Source: scraped (Glassdoor, Careers)        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌── Story Bank ──────────────────────────────┐ │
│ │ Linked Stories (3):                         │ │
│ │                                             │ │
│ │ ✓ Story 1: "Customer obsession..."          │ │
│ │   Key takeaway: [_____________]             │ │
│ │                                             │ │
│ │ ✓ Story 3: "Project failure..."             │ │
│ │   Key takeaway: [_____________]             │ │
│ │                                             │ │
│ │ [Add another story]                         │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [Save]                                          │
└─────────────────────────────────────────────────┘
```

## Alternatives Considered

1. **Keep Document type, add sections as fields**
   - Rejected: Document is too generic. PrepSheet is a distinct concept with specific sections.

2. **Duplicate stories in each sheet**
   - Rejected: One master story bank is a design principle. Sheets reference, not duplicate.

3. **Scrape on-demand only**
   - Rejected: Too slow for user experience. Bundled data + refresh is better.

4. **Full-page wizard instead of modal**
   - Rejected: Modal keeps user on dashboard, feels faster, less navigation friction.

## Implementation Notes

- Existing `Document` records should be migrated to `PrepSheet` format (or deprecated)
- `IDocumentService` becomes `IPrepSheetService`
- React components renamed: `DocumentPage` → `PrepSheetEditor`, etc.
- Scraper pipeline needs export script to generate bundled JSON
- JD parsing uses Gemini API (existing agent infrastructure)

## Verification Status

- [ ] Type system updated
- [ ] Service interface updated
- [ ] Scraper export script created
- [ ] Creation wizard UI built
- [ ] Section editors built
- [ ] Bundled data shipped