# Product Specifications Index

**Last Updated**: 2026-02-14

This directory contains specifications for all Mockvue features. Each spec includes user stories, acceptance criteria, and success metrics.

## Complete Features

- [Document Editor](./document-editor.md) — Q&A document editing with drag-and-drop and auto-save
- [Document Management](./document-management.md) — Browse, search, sort, and organize documents
- [User Onboarding](./user-onboarding.md) — Multi-step first-time setup flow
- [Story Management](./story-management.md) — STAR-method behavioral interview stories
- [Cross-Platform Support](./cross-platform.md) — Electron desktop + Web browser via service abstraction

## In Progress

- [AI Assistant](./ai-assistant.md) — AI-powered writing features (UI complete, LLM integration pending)
- [Resume Management](./resume-management.md) — Resume data entry (onboarding form exists, standalone page planned)
- [Dashboard Widgets](./dashboard-widgets.md) — Progress chart and daily tasks (UI exists, real data pending)

## Planned

- [Interview Response Builder](./interview-response-builder.md) — Build and practice responses from stories (types/services exist, no UI)

## Future Considerations

_Features under consideration or in early planning:_
- Cloud sync between devices
- Collaborative editing
- Mobile support (React Native)
- Plugin system

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
