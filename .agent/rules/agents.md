---
trigger: always_on
---


# Agent Operating Guide

**Version:** 1.0.0  
**Last Updated:** 2026-02-16

## Purpose

This file serves as your navigation map. It points you to the right context for your current task. This is NOT a comprehensive instruction manual—it's a table of contents.

## Core Principles

1. **Repository as System of Record**: If it's not in this repository, it doesn't exist.
2. **Progressive Disclosure**: Start here, then navigate to specific documentation as needed.
3. **Mechanical Enforcement**: Architectural rules are enforced by linters, not convention.
4. **Documentation is Code**: All docs are versioned, structured, and kept current.

## Getting Started

### First-Time Setup
1. Read `ARCHITECTURE.md` for the system-wide domain map and platform architecture
2. Review `docs/DESIGN.md` for architectural patterns and constraints
3. Check `docs/design-docs/core-beliefs.md` for foundational principles

### Before Starting Work
1. Identify the affected domain(s) from `ARCHITECTURE.md`
2. Check `docs/QUALITY_SCORE.md` for current quality baseline
3. Review relevant product specs in `docs/product-specs/`
4. For complex work, check `docs/exec-plans/active/` for ongoing initiatives

## Where to Find Information

### Product & Design
- **Product Specifications**: `docs/product-specs/index.md`
  - What features exist, user requirements, acceptance criteria
- **Design Decisions**: `docs/design-docs/index.md`
  - Why architectural choices were made

### Architecture & Code
- **System Architecture**: `ARCHITECTURE.md`
  - Domain boundaries, platform abstraction, service layer
- **Architectural Patterns**: `docs/DESIGN.md`
  - Service abstraction, cross-platform patterns, state management
- **Quality Standards**: `docs/QUALITY_SCORE.md`
  - Test coverage requirements, quality grades by domain
- **Security Requirements**: `docs/SECURITY.md`
  - Electron security, data validation, boundary enforcement
- **Reliability Patterns**: `docs/RELIABILITY.md`
  - Error handling, auto-save, offline support

### Frontend Development
- **Frontend Guide**: `docs/FRONTEND.md`
  - Component patterns, Tailwind conventions, Radix UI usage

### Implementation Planning
- **Active Plans**: `docs/exec-plans/active/`
  - Current initiatives, progress tracking, decision logs
- **Completed Plans**: `docs/exec-plans/completed/`
  - Historical context, lessons learned
- **Tech Debt**: `docs/exec-plans/tech-debt-tracker.md`
  - Known issues, prioritization, remediation plans

### Existing Guides (Legacy)
- **Service Usage**: `docs/guide/SERVICES_USAGE.md`
- **Electron Setup**: `docs/guide/ELECTRON_SETUP.md`
- **Testing Guide**: `docs/guide/TESTING_GUIDE.md`

### Reference Materials
Located in `docs/references/`:
- Technology-specific guides formatted for LLM consumption
- Third-party library quick references

## Working in This Repository

### Development Workflow
1. **Understand the Task**: Read related product specs and design docs
2. **Plan the Work**: For complex tasks, create an execution plan in `docs/exec-plans/active/`
3. **Implement**: Follow architectural constraints from `ARCHITECTURE.md`
4. **Validate**: Run `npm run lint` and test on both platforms
5. **Document**: Update relevant docs as part of the same PR

### Key Technology
- **React 18** + **TypeScript** with **Vite** build system
- **Electron 28** for desktop
- **Tailwind CSS** + **Radix UI** for styling and components
- **Service Abstraction Layer** for cross-platform code reuse

### Style & Theme Reference
The **document editor** (`src/components/documents/`) defines the canonical style and text patterns for the project. All new UI must match its look and feel. See `docs/FRONTEND.md` for the full design system extracted from these components.

Key style rules:
- **Light-mode only** — no dark mode, no ThemeContext usage
- Page backgrounds: `bg-gray-100`
- Cards/panels: `bg-surface` (#fafbfc, softer than pure white)
- Secondary buttons: `bg-surface border-gray-200 hover:bg-gray-50 text-gray-700`
- Primary actions: `bg-blue-600 hover:bg-blue-700 text-white rounded-lg`
- Icons: Lucide React, `w-4 h-4` (small) / `w-5 h-5` (default)
- System font stack, `text-3xl font-bold` for titles, `text-sm` for body

### When Implementation Fails
If you're stuck:
1. Check if required service methods exist in `src/services/interfaces.ts`
2. Verify platform-specific implementations exist in `src/services/electron/`
3. Look for similar patterns in completed work
4. If capability is missing: document the gap, implement the service method first

## Key Constraints

### Platform Architecture
Cross-platform through service abstraction:
```
React Components (Platform Agnostic)
         ↓
Service Abstraction Layer (interfaces.ts)
         ↓
Electron Services
```

### Service Domains
- **Documents** (`IDocumentService`): CRUD, search, persistence
- **Users** (`IUserService`): Profiles, onboarding, stories, interviews
- **Agent** (`IAgentService`): AI features (summarize, rewrite, expand, etc.)
- **Notifications** (`INotificationService`): Cross-platform notifications

### Code Quality
- All service contracts defined in `src/services/interfaces.ts`
- TypeScript strict mode enabled
- ESLint with zero warnings policy (`--max-warnings 0`)

## Navigation Quick Reference

| Need | Location |
|------|----------|
| What to build | `docs/product-specs/` |
| Why it's designed this way | `docs/design-docs/` |
| How the system is organized | `ARCHITECTURE.md` |
| Architectural patterns | `docs/DESIGN.md` |
| Quality expectations | `docs/QUALITY_SCORE.md` |
| Current work in progress | `docs/exec-plans/active/` |
| Security patterns | `docs/SECURITY.md` |
| Frontend patterns | `docs/FRONTEND.md` |
| Reliability standards | `docs/RELIABILITY.md` |
| Tech debt backlog | `docs/exec-plans/tech-debt-tracker.md` |

---

**Remember**: This file is your starting point. Navigate to specific documentation as needed for your task. Don't try to hold everything in context—use the structured docs to find what you need.

