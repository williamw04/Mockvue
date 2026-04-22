# Architecture

**Version**: 2.0.0
**Last Updated**: 2026-04-14

## Overview

Mockvue is an **Electron desktop application** using a React codebase. The key architectural concept is a **Service Abstraction Layer** that provides a unified API for the underlying platform.

## Platform Architecture

```
+-------------------------------------------------------+
|              React Application (UI Layer)              |
|    Components, Hooks, Routing - Platform Agnostic      |
+-----------------------------+-------------------------+
                              |
                              v
+-------------------------------------------------------+
|            Service Abstraction Layer                    |
|               (src/services/)                          |
|  +------------+---------+---------+------------------+ |
|  | Documents  |  User   |  Agent  |  Notifications   | |
|  |  Service   | Service | Service |    Service        | |
|  +------------+---------+---------+------------------+ |
|  +------------+---------+---------+------------------+ |
|  | Coaching   | Voice   |         |                  | |
|  |  Service   |Interview|         |                  | |
|  +------------+---------+---------+------------------+ |
+-----------------------------+-------------------------+
                              |
                              v
               +---------------------+
               |  Electron Platform  |
               |   (services/        |
               |    electron/)       |
               +---------------------+
                              |
                              v
               +---------------------+
               |  IPC + Node.js      |
               |  File System        |
               |  Native Dialogs     |
               +---------------------+
```

## Domain Map

### Prep Sheets Domain

- **Purpose**: Company-specific interview cheat sheets with 11 structured sections, autofilled from scraped data and job descriptions
- **Service Interface**: `IPrepSheetService` (replaces `IDocumentService`)
- **Key Operations**: prep sheet CRUD, scraped data retrieval, JD parsing, section editing
- **Storage**: File system (Electron) — JSON files per sheet
- **Dependencies**: Users (story references), Company Question Ingestion (scraper data)
- **Sections**: Company Snapshot, Role Breakdown, Story Bank, Question Mapping, Company Alignment, Strengths/Weaknesses, Key Talking Points, Questions for Interviewer, Technical Prep, Logistics, Post-Interview Reflection

### Users Domain

- **Purpose**: User profiles, onboarding flow, resume/story management, interview responses, analysis caching
- **Service Interface**: `IUserService`
- **Key Operations**: profile management, onboarding, CRUD for stories/resumes/interviews, candidate profile, resume analysis caching, ATS analysis caching
- **Storage**: File system (Electron)
- **Dependencies**: None

### Agent Domain (AI)

- **Purpose**: AI-powered features via a single Gemini model with tool-calling
- **Service Interface**: `IAgentService` (extends `ITaskExecutionService` + `IResumeService` + `IAssistantSessionService`)
- **Key Operations**: resume analysis, ATS analysis, chat with resume, assistant session CRUD, turn execution with streaming
- **Runtime**: `electron/agent/` -- single Gemini model with configurable prompts per assistant type
- **Tools**: 16 tools for resume data, coaching, memory, and change management
- **NOT** a multi-agent pipeline -- one model, different system prompts
- **Dependencies**: Documents, Users (for data access)

### Agent Tools (16 total)

| Tool                 | Purpose                                |
| -------------------- | -------------------------------------- |
| `resume_get`         | Get complete resume data               |
| `resume_search`      | Search resume data by keyword          |
| `bullet_get_weakest` | Get lowest-scoring bullets             |
| `bullet_get_all`     | Get all bullet analyses with filters   |
| `trigger_points_get` | Get trigger points from analysis       |
| `story_get_all`      | Get all STAR stories                   |
| `memory_lookup`      | Retrieve session memory                |
| `memory_save`        | Store session memory                   |
| `memory_clear`       | Clear session memory                   |
| `goal_create`        | Create coaching goal                   |
| `todo_create`        | Create action item                     |
| `todo_complete`      | Mark todo as done                      |
| `change_propose`     | Propose resume edit with alternatives  |
| `profile_get`        | Get coaching profile                   |
| `profile_update`     | Update preferences (role, style, etc.) |
| `version_create`     | Save resume version snapshot           |

### Notifications Domain

- **Purpose**: Cross-platform user notifications
- **Service Interface**: `INotificationService`
- **Key Operations**: show, showSuccess, showError, showInfo, permission management
- **Platform Behavior**: Native notifications (Electron)
- **Dependencies**: None

### Coaching Domain

- **Purpose**: Coaching workspace for tracking goals, todos, staged resume changes, version history, and user preferences
- **Service Interface**: `ICoachingService`
- **Key Operations**: goal CRUD, todo CRUD, change proposals (accept/reject/modify), change log, resume versioning, user profile
- **Storage**: File system (`electron/agent/coaching-store.ts`)
- **Dependencies**: Agent (tools call coaching store), Users (resume data)

### Voice Interview Domain

- **Purpose**: Infrastructure for voice-based mock interview sessions
- **Service Interface**: `IVoiceInterviewService`
- **Key Operations**: session lifecycle (create, start, pause, resume, end), transcript management, events
- **Status**: Infrastructure only -- no UI, no real voice provider, deprioritized
- **Dependencies**: None

## Package Structure

```
/
├── AGENTS.md                       # AI agent operating guide
├── CONTRIBUTING.md                 # How to develop, test, and contribute
├── ARCHITECTURE.md                 # This file
├── docs/
│   ├── PRODUCT_VISION.md           # Product definition and core loop
│   ├── FEATURE_PURPOSES.md         # Feature purposes and user stories
│   ├── FRONTEND.md                 # Frontend conventions
│   ├── DESIGN.md                   # Architectural patterns
│   ├── QUALITY_SCORE.md            # Quality tracking
│   ├── SECURITY.md                 # Security patterns
│   ├── tech-debt-tracker.md        # Known issues
│   ├── features/                   # Per-feature documentation
│   │   ├── index.md
│   │   ├── core-stories/
│   │   ├── dashboard/
│   │   ├── practice-tools/
│   │   ├── prep-sheets/
│   │   ├── resume-architect/
│   │   ├── user-onboarding/
│   │   ├── company-question-ingestion/
│   │   └── archive/                # Stale documentation
├── src/
│   ├── App.tsx                     # Root component with routing
│   ├── main.tsx                    # Entry point with ServicesProvider
│   ├── types.ts                    # Shared TypeScript type definitions
│   ├── components/
│   │   ├── TopNavBar.tsx           # Floating glassmorphic navigation
│   │   ├── Dashboard.tsx           # Main dashboard view
│   │   ├── ProfilePage.tsx         # User profile & resume viewer
│   │   ├── StoriesPage.tsx         # Core stories grid + STAR editor
│   │   ├── ResumeReviewPage.tsx    # 4-tab resume analysis interface
│   │   ├── ErrorBoundary.tsx       # App-level error boundary
│   │   ├── documents/              # Document editor components
│   │   ├── onboarding/             # 5-step onboarding flow
│   │   ├── profile/                # Resume Architect sub-components
│   │   └── ui/                     # Reusable UI primitives (shadcn)
│   ├── services/
│   │   ├── interfaces.ts           # Service contracts (6 interfaces)
│   │   ├── factory.ts              # Platform detection & service creation
│   │   ├── context.tsx             # React context provider & hooks
│   │   ├── index.ts                # Public API exports
│   │   └── electron/               # Electron implementations
│   │       ├── agent.ts            # AI agent service
│   │       ├── coaching.ts         # Coaching workspace service
│   │       ├── documents.ts        # Document service
│   │       ├── notifications.ts    # Notification service
│   │       ├── user.ts             # User service
│   │       ├── voiceInterview.ts   # Voice interview service
│   │       └── index.ts
│   ├── test/                       # Test utilities and mocks
│   └── utils/                      # Platform detection, seeds, etc.
├── electron/                        # Electron main process
│   ├── main.ts                     # Main process entry + IPC handlers
│   ├── preload.ts                  # Preload script (contextBridge)
│   ├── storage.ts                  # File system storage
│   ├── parser.ts                   # Resume PDF parsing (Gemini)
│   ├── ipc-utils.ts                # IPC handler registry
│   ├── agent/                      # AI agent runtime
│   │   ├── runtime.ts              # AgentRuntime class
│   │   ├── model.ts                # Gemini integration + tool-calling loop
│   │   ├── tools.ts                # 16 tool definitions + executor
│   │   ├── prompts.ts              # System prompts per assistant type
│   │   ├── knowledge.ts            # ResumeDoc builder (normalized read model)
│   │   ├── memory-store.ts         # Session/message/memory persistence
│   │   ├── coaching-store.ts       # Goals, todos, changes, versions
│   │   └── logger.ts               # Opt-in file-based logging
│   └── voice/                      # Voice interview infrastructure
│       ├── controller.ts           # Session lifecycle
│       ├── provider.ts             # Provider adapter interface
│       ├── text-only-provider.ts   # Text-only stub
│       ├── session-store.ts        # In-memory session storage
│       └── ipc.ts                  # IPC handlers
└── public/                         # Static assets
```

## Service Abstraction Pattern

### Contract-First Design

All service capabilities are defined as TypeScript interfaces in `src/services/interfaces.ts`. Electron implementations satisfy this contract:

```typescript
INotificationService     -> ElectronNotificationService
IAgentService            -> ElectronAgentService
IVoiceInterviewService   -> ElectronVoiceInterviewService
IUserService             -> ElectronUserService
IDocumentService         -> ElectronDocumentService
ICoachingService         -> ElectronCoachingService
```

### React Integration

Services are provided through React Context and consumed via hooks:

```typescript
useServices(); // All services
useNotifications(); // INotificationService
useAgent(); // IAgentService
useVoiceInterview(); // IVoiceInterviewService
useUser(); // IUserService
useDocuments(); // IDocumentService
useCoaching(); // ICoachingService
```

## Routing Architecture

- **Router**: `HashRouter` for `file://` protocol compatibility (Electron standard)
- **Routes**: `/` (Dashboard), `/profile`, `/document/:id`, `/stories`, `/resume-review`, `/onboarding`
- **Protection**: `ProtectedRoute` wrapper checks onboarding completion

## Dependency Rules

### Cross-Domain

- Components may use multiple services (e.g., Dashboard uses Documents + User)
- Services should NOT import from other services directly
- Shared types live in `src/types.ts`
- Cross-cutting utilities live in `src/utils/`

### Platform Boundary

- Components NEVER import from `src/services/electron/` directly
- Components only interact with services via hooks from `src/services/context.tsx`
- Platform-specific code is strictly isolated in `src/services/electron/`

## Validation Commands

```bash
# Lint the codebase
npm run lint

# Type check
npx tsc --noEmit

# Development (electron)
npm run electron:dev

# Production build
npm run build

# Run tests
npm test
```
