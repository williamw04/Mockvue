# Feature: Company Question Ingestion Pipeline

**Status**: In Progress
**Last Updated**: 2026-04-17
**Downstream Consumer**: [Prep Sheets](../prep-sheets/product-spec.md)

## User Story
As a job seeker, I want Mockvue to surface company-specific interview questions so that I can practice against realistic prompts for my target companies and roles.

## Overview

This feature builds the ingestion pipeline for collecting, normalizing, and storing common interview questions by company, role, and stage. The product direction is intentionally scraper-heavy, but the implementation must still preserve provenance, source quality, and operational resilience.

The pipeline should support:
- source discovery
- source-specific extraction
- normalization into a canonical schema
- provenance tracking
- ranking and freshness metadata
- downstream reuse by behavioral and mock interview agents

## Goals

- Ingest company-specific questions at scale from multiple public sources
- Preserve source provenance and quality metadata for every question observation
- Normalize company names, roles, stages, and duplicate questions
- Feed a reusable question knowledge layer for later interview practice features

## Non-Goals

- Final interview simulator UX
- Voice execution
- Perfect legal/compliance automation beyond source policy labeling and operator review fields
- Human curation-only workflow as the main ingestion path

## Acceptance Criteria

- [ ] Source registry exists with source-specific scrape strategy metadata
- [ ] Normalized schema exists for companies, roles, questions, observations, and provenance
- [ ] Pipeline can ingest from at least one scraper-heavy source path and one safer editorial/open source path
- [ ] Duplicate question clustering is supported
- [ ] All records store source URL, source type, access method, and timestamps
- [ ] Extracted data can be queried by company and role
- [ ] Behavioral assistant can later consume normalized question data without schema changes

## MVP Source Strategy

- Scraper-heavy support for selected public web sources
- Preserve ability to mark high-risk sources separately
- Treat provenance as first-class; never flatten away original source observations

## Primary Consumers

- **Prep Sheets** — Company Snapshot section (values, mission), Question Mapping section (interview questions), Technical Prep section (technical questions)
- **Behavioral Assistant** — Future AI coaching feature
- **Mock Interview Simulator** — Future practice feature

## Downstream Consumer: Prep Sheets

The scraper pipeline feeds the **Prep Sheets** feature directly:

| Scraper Output | Prep Sheet Section | Source Adapter |
|----------------|-------------------|----------------|
| Company values/mission | Company Snapshot | `careers.ts` |
| Interview format notes | Company Snapshot | `glassdoor.ts` |
| Behavioral interview questions | Question Mapping | `glassdoor.ts`, `reddit.ts` |
| Technical/coding questions | Technical Prep | `leetcode.ts` |
| Role requirements (from job postings) | Role Breakdown | `careers.ts` |

### Data Flow

```
[Scraper Pipeline]                 [Prep Sheets Feature]
tools/question-ingestion/          docs/features/prep-sheets/
         |                                    |
         v                                    v
   ingestion.db (SQLite)         Prep Sheet Creation Wizard
         |                                    |
         | [export-bundle script]             |
         +-------------------------->---------+
                                              |
                                              v
                                     ScrapedCompanyData
                                              |
                                              v
                                     Autofill Company Snapshot,
                                     Question Mapping, Technical Prep
```

### Export Format

The scraper exports company data in a format compatible with Prep Sheets:

```typescript
interface ScrapedCompanyExport {
  companyName: string;
  values: string[];           // → Company Snapshot
  mission?: string;           // → Company Snapshot
  interviewQuestions: string[];  // → Question Mapping
  technicalQuestions: string[];  // → Technical Prep
  roleRequirements: string[];    // → Role Breakdown
  lastFetchedAt: string;
  sources: string[];          // provenance
}
```

## Success Metrics

- Number of companies with normalized question coverage
- Number of unique question clusters per supported company
- Extraction success rate per source
- Duplicate clustering precision on sampled reviews

## Design References

- See: `docs/design-docs/company-question-ingestion-architecture.md`
- See: `docs/product-specs/agent-foundation.md`

## Implementation Notes

- Initial implementation should be isolated from core assistant runtime work
- Source adapters should be modular and independently testable
- Provenance and risk metadata are mandatory, not optional
