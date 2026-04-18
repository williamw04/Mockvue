# Features Index

**Last Updated**: 2026-04-17

## Core Documents

- [Product Vision](../PRODUCT_VISION.md) - What Mockvue is, who it's for, the core loop
- [Feature Purposes](../FEATURE_PURPOSES.md) - Why each feature exists and what it does for the user

## Active Features

| Feature | Purpose | Status |
|---------|---------|--------|
| [Onboarding](./user-onboarding/) | Get user from zero to profile + resume + story matches | Built |
| [Dashboard](./dashboard/) | Guided roadmap through interview prep stages | Needs rewrite |
| [Resume Architect](./resume-architect/) | AI coaching for resume analysis and improvement | Built, actively improving |
| [Core Stories](./core-stories/) | 10 STAR-method stories mapped to behavioral categories | Built, needs redesign |
| [Prep Sheets](./prep-sheets/) | Company-specific interview cheat sheets with scraped data autofill | Planned (replacing Documents) |
| [Practice Tools](./practice-tools/) | Flashcards, simulator, AI mock interviews | Planned |
| [Company Question Ingestion](./company-question-ingestion/) | Scraper pipeline for company values and interview questions | In Progress |

## Per-Feature Documentation

Each feature folder contains:
```
feature-name/
├── product-spec.md     # Detailed requirements and acceptance criteria
├── design.md           # Architecture decisions (if needed)
└── exec-plan.md        # Implementation phases (if needed)
```

## Completed Projects

Cross-cutting completed work in [completed/](./completed/):
- Initial Scaffold, Remove Dark Mode, Code Review Remediation

## Archived Documentation

Old documentation that was stale or inconsistent with the codebase is in [archive/](./archive/). These docs describe features as they were planned or partially implemented, and may contain useful historical context.

Archived document feature docs:
- [document-editor/](./archive/document-editor/) - Old Q&A document feature (replaced by Prep Sheets)
- [document-management/](./archive/document-management/) - Old document management feature (replaced by Prep Sheets)
