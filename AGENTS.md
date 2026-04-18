
# Agent Operating Guide

**Version:** 2.0.0
**Last Updated:** 2026-04-14

## Purpose

This file serves as your navigation map. It points you to the right context for your current task. This is NOT a comprehensive instruction manual -- it's a table of contents.

## Core Principles

1. **Repository as System of Record**: If it's not in this repository, it doesn't exist.
2. **Progressive Disclosure**: Start here, then navigate to specific documentation as needed.
3. **Mechanical Enforcement**: Architectural rules are enforced by linters, not convention.
4. **Documentation is Code**: All docs are versioned, structured, and kept current.

## Getting Started

### First-Time Setup
1. Read `docs/PRODUCT_VISION.md` to understand what Mockvue is and why it exists
2. Read `docs/FEATURE_PURPOSES.md` to understand each feature's role
3. Read `ARCHITECTURE.md` for the system architecture and service layer
4. Review `docs/FRONTEND.md` for styling conventions

### Before Starting Work
1. Check `docs/FEATURE_PURPOSES.md` to understand the feature's purpose
2. Identify the affected service domain(s) from `ARCHITECTURE.md`
3. Review `docs/FRONTEND.md` for styling patterns
4. Check `docs/tech-debt-tracker.md` for known issues in the area

## Where to Find Information

### Product Vision
- **What is Mockvue**: `docs/PRODUCT_VISION.md` -- product definition, core loop, design principles
- **Feature Purposes**: `docs/FEATURE_PURPOSES.md` -- why each feature exists, user stories, current state
- **Feature Index**: `docs/features/index.md` -- links to per-feature specs

### Architecture & Code
- **System Architecture**: `ARCHITECTURE.md` -- service layer, routing, dependency rules
- **Frontend Patterns**: `docs/FRONTEND.md` -- design system, component patterns, styling conventions
- **Design Patterns**: `docs/DESIGN.md` -- service abstraction, state management, error handling
- **Quality Standards**: `docs/QUALITY_SCORE.md` -- test coverage, quality grades
- **Tech Debt**: `docs/tech-debt-tracker.md` -- known issues, prioritization

### Archived Documentation
Old documentation that was stale or inconsistent is in `docs/features/archive/`. May contain useful historical context but should not be trusted as accurate.

## Working in This Repository

### Development Workflow
1. **Understand the Task**: Check `docs/FEATURE_PURPOSES.md` for the feature's purpose
2. **Plan the Work**: For complex tasks, create a spec in `docs/features/<feature-name>/`
3. **Implement**: Follow architectural constraints from `ARCHITECTURE.md`
4. **Style**: Match patterns from `docs/FRONTEND.md`
5. **Validate**: Run `npm run lint` and `npm test`
6. **Document**: Update relevant docs as part of the same PR

### Key Technology
- **React 18** + **TypeScript** with **Vite** build system
- **Electron** for desktop
- **Tailwind CSS** + **Radix UI** (via shadcn/ui) for styling and components
- **Gemini AI** agent with tool-calling for AI features
- **Service Abstraction Layer** for platform-agnostic code

### Style Reference
See `docs/FRONTEND.md` for the full design system. Key rules:

- **Light-mode only** -- no dark mode, no ThemeContext usage
- Page backgrounds: `bg-gray-100`
- Cards/panels: `bg-surface` (#fafbfc) with `rounded-2xl shadow-lg border border-gray-100`
- Navigation: TopNavBar (floating glassmorphic pill), NOT a sidebar
- Primary actions: `bg-blue-600 hover:bg-blue-700 text-white rounded-lg`
- Gradient accent: `bg-gradient-to-br from-blue-500 to-purple-600` (avatars, feature CTAs)
- Icons: Lucide React, `w-4 h-4` (small) / `w-5 h-5` (default)
- System font stack, `text-3xl font-bold` for page titles, `text-sm` for body

### When Implementation Fails
If you're stuck:
1. Check if required service methods exist in `src/services/interfaces.ts`
2. Verify platform-specific implementations exist in `src/services/electron/`
3. Look for similar patterns in existing components
4. If capability is missing: document the gap, implement the service method first

## Key Constraints

### Platform Architecture
Cross-platform through service abstraction:
```
React Components (Platform Agnostic)
         |
Service Abstraction Layer (interfaces.ts)
         |
Electron Services
```

### Service Domains (6 services)
- **Notifications** (`INotificationService`): System notifications
- **Agent** (`IAgentService`): AI features, combines `ITaskExecutionService` + `IResumeService` + `IAssistantSessionService`
- **Voice Interview** (`IVoiceInterviewService`): Voice interview sessions (infrastructure only, no UI)
- **User** (`IUserService`): Profiles, onboarding, resumes, stories, interview responses, candidate profiles, analysis caching
- **Documents** (`IDocumentService`): Document CRUD, search
- **Coaching** (`ICoachingService`): Goals, todos, staged changes, versions, user coaching profile

### AI Agent
- Single Gemini model with configurable system prompts per assistant type
- 16 tools for resume data, coaching, memory, and change management
- NOT a multi-agent pipeline
- Lives in `electron/agent/`: runtime, tools, prompts, knowledge, memory-store, coaching-store

### Code Quality
- All service contracts defined in `src/services/interfaces.ts`
- TypeScript strict mode enabled
- ESLint with zero warnings policy (`--max-warnings 0`)

## Navigation Quick Reference

| Need | Location |
|------|----------|
| What is Mockvue | `docs/PRODUCT_VISION.md` |
| Why each feature exists | `docs/FEATURE_PURPOSES.md` |
| What to build (per feature) | `docs/features/<feature-name>/product-spec.md` |
| How the system is organized | `ARCHITECTURE.md` |
| Styling and UI patterns | `docs/FRONTEND.md` |
| Architectural patterns | `docs/DESIGN.md` |
| Quality expectations | `docs/QUALITY_SCORE.md` |
| Tech debt backlog | `docs/tech-debt-tracker.md` |
| Old/archived docs | `docs/features/archive/` |

---

**Remember**: This file is your starting point. Navigate to specific documentation as needed for your task. Don't try to hold everything in context -- use the structured docs to find what you need.
