# Product Specifications Index

**Last Updated**: 2026-03-02

This directory contains specifications for all Mockvue features. Each spec includes user stories, acceptance criteria, and success metrics.

## Stable / Core Features

- [Document Editor](./document-editor.md) — Q&A document editing with drag-and-drop and auto-save
- [Document Management](./document-management.md) — Browse, search, sort, and organize documents
- [Platform Architecture](./platform-architecture.md) — Electron desktop architecture
- [Resume Parsing & Import](./user-onboarding.md) — Upload resume PDF, AI-powered parsing, profile auto-fill
- [Behavioral Core Stories](./story-management.md) — 10-category STAR format matrix with AI suggestions

## In Progress

- Profile Page — View stored resume data, work experiences, projects, skills, and original PDF
- [AI Interview Prep Agents](./ai-agents.md) — Multi-agent pipeline: Resume Architect (✅ Phase 1 complete) → Narrative Coach → Mock Simulator

## Removed

- ~~[AI Assistant](./ai-assistant.md)~~ — Removed. Superseded by AI Interview Prep Agents above.

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
