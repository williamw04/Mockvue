# Product Specifications Index

**Last Updated**: 2026-02-16

This directory contains specifications for all Mockvue features. Each spec includes user stories, acceptance criteria, and success metrics.

## Stable / Core Features

- [Document Editor](./document-editor.md) — Q&A document editing with drag-and-drop and auto-save
- [Document Management](./document-management.md) — Browse, search, sort, and organize documents
- [Platform Architecture](./platform-architecture.md) — Electron desktop architecture
- [Resume Parsing & Import](./user-onboarding.md) — Upload resume PDF, AI-powered parsing, profile auto-fill

## In Progress

- [Story Management](./story-management.md) — STAR-format story management (unblocked by Resume Parsing)
- Profile Page — View stored resume data, work experiences, projects, skills, and original PDF

## Deferred / Blocked

- [AI Assistant](./ai-assistant.md) — ⛔️ **Deferred**. Context-aware editing tools planned for future.

## Planned / Future

- [Dashboard Widgets](./dashboard-widgets.md) — Progress chart and daily tasks
- [Resume Management](./resume-management.md) — Standalone resume editor (post-import)
- [Interview Response Builder](./interview-response-builder.md) — Build responses from stories


## Spec Template

When creating a new product spec, use this template:

```markdown
# Feature: [Name]

**Status**: [Planned | In Progress | Complete]
**Last Updated**: YYYY-MM-DD

## User Story
As a [user type], I want to [action] so that [benefit].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Success Metrics
- Metric 1
- Metric 2

## Design References
- See: docs/design-docs/[relevant-decision].md

## Implementation Notes
- Which service domain(s) affected
- Platform-specific considerations
```
