# Product Specifications Index

**Last Updated**: 2026-02-14

This directory contains specifications for all Mockvue features. Each spec includes user stories, acceptance criteria, and success metrics.

## Core Features

- [Document Editor](./document-editor.md) - Rich text document editing with auto-save
- [Document Management](./document-management.md) - Create, organize, search, and export documents
- [User Onboarding](./user-onboarding.md) - First-time user setup flow
- [AI Assistant](./ai-assistant.md) - AI-powered writing features
- [Story Management](./story-management.md) - Interview stories and STAR format responses

## Cross-Platform

- [Cross-Platform Support](./cross-platform.md) - Electron desktop + Web browser support

## Planned Features

_Features under consideration or in planning:_
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
