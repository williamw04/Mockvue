# Features Index

**Last Updated**: 2026-04-11

This directory contains all feature-related documentation organized by feature. Each feature folder contains its product spec, design doc, and exec plan (where applicable).

## Stable / Core Features

| Feature | Product Spec | Design | Exec Plan |
|---------|-------------|--------|-----------|
| [Document Editor](./document-editor/) | ✅ product-spec.md | - | - |
| [Document Management](./document-management/) | ✅ product-spec.md | - | - |
| [Platform Architecture](./platform-architecture/) | ✅ product-spec.md | See docs/service-abstraction.md | See completed/ |
| [User Onboarding](./user-onboarding/) | ✅ product-spec.md | - | - |
| [Story Management](./story-management/) | ✅ product-spec.md | - | - |

## In Progress

| Feature | Product Spec | Design | Exec Plan |
|---------|-------------|--------|-----------|
| [AI Agents](./ai-agents/) | ✅ product-spec.md | - | - |
| [Agent Foundation](./agent-foundation/) | ✅ product-spec.md | ✅ design.md | ✅ exec-plan.md |
| [Resume Assistant](./resume-assistant/) | ✅ product-spec.md | ✅ design.md | - |
| [Company Question Ingestion](./company-question-ingestion/) | ✅ product-spec.md | ✅ design.md | ✅ exec-plan.md |
| [Voice Interview Simulator](./voice-interview-simulator/) | ✅ product-spec.md | ✅ design.md | ✅ exec-plan.md |
| [ATS Compatibility Checks](./ats-compatibility-checks/) | - | - | ✅ exec-plan.md |

## Planned / Future

| Feature | Product Spec | Design | Exec Plan |
|---------|-------------|--------|-----------|
| [Dashboard Widgets](./dashboard-widgets/) | ✅ product-spec.md | - | - |
| [Resume Management](./resume-management/) | ✅ product-spec.md | - | - |
| [Interview Response Builder](./interview-response-builder/) | ✅ product-spec.md | - | - |

## Deprecated

| Feature | Notes |
|---------|-------|
| [AI Assistant](./ai-agents/ai-assistant-deprecated.md) | Removed. Superseded by AI Agents. |

## Completed Projects

Cross-cutting completed work that doesn't belong to a single feature:
- [Initial Scaffold](./completed/initial-scaffold.md) — Repository setup
- [Remove Dark Mode](./completed/remove-dark-mode.md) — Light-only theme
- [Code Review Remediation](./completed/code-review-remediation.md) — Security and quality fixes

## Cross-Cutting Documentation

Located at `docs/` root (not feature-specific):
- [Core Beliefs](../core-beliefs.md) — Foundational principles
- [Service Abstraction](../service-abstraction.md) — Cross-platform architecture
- [Tech Debt Tracker](../tech-debt-tracker.md) — Known issues and remediation

## Folder Structure Convention

Each feature folder follows this pattern:
```
feature-name/
├── product-spec.md     # User requirements, acceptance criteria
├── design.md           # Architecture decisions (optional)
└── exec-plan.md        # Implementation plan (optional)
```

## Adding a New Feature

1. Create folder: `docs/features/<feature-name>/`
2. Add `product-spec.md` with user story and acceptance criteria
3. Add `design.md` if architectural decisions are needed
4. Add `exec-plan.md` if implementation is planned
5. Update this index with the new feature