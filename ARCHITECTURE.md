# Architecture

**Version**: 1.0.0  
**Last Updated**: 2026-02-14

## Overview

Mockvue is a cross-platform document editor that runs as both an **Electron desktop application** and a **web application** using a shared React codebase. The key architectural concept is a **Service Abstraction Layer** that provides a unified API regardless of the underlying platform.

## Platform Architecture

```
┌───────────────────────────────────────────────────────┐
│              React Application (UI Layer)               │
│    Components, Hooks, Routing - Platform Agnostic      │
└─────────────────────────┬─────────────────────────────┘
                          │
                          ▼
┌───────────────────────────────────────────────────────┐
│            Service Abstraction Layer                    │
│               (src/services/)                          │
│  ┌────────────┬───────────┬──────────┬─────────────┐  │
│  │ Documents  │   Users   │  Agent   │ Notifications│  │
│  │  Service   │  Service  │ Service  │   Service    │  │
│  └────────────┴───────────┴──────────┴─────────────┘  │
└─────────────────────────┬─────────────────────────────┘
                          │
                ┌─────────┴──────────┐
                ▼                    ▼
    ┌──────────────────┐   ┌──────────────────┐
    │ Electron Platform │   │   Web Platform   │
    │  (services/      │   │  (services/      │
    │   electron/)     │   │   web/)          │
    └──────────────────┘   └──────────────────┘
             │                       │
             ▼                       ▼
    ┌──────────────────┐   ┌──────────────────┐
    │ IPC + Node.js    │   │ Browser APIs     │
    │ File System      │   │ IndexedDB        │
    │ Native Dialogs   │   │ Web APIs         │
    └──────────────────┘   └──────────────────┘
```

## Domain Map

### Documents Domain
- **Purpose**: Document CRUD operations, full-text search, persistence
- **Service Interface**: `IDocumentService`
- **Key Operations**: create, read, update, delete, search
- **Storage**: File system (Electron) / IndexedDB (Web)
- **Dependencies**: None (foundational)

### Users Domain
- **Purpose**: User profiles, onboarding flow, resume/story management, interview responses
- **Service Interface**: `IUserService`
- **Key Operations**: profile management, onboarding, CRUD for stories/resumes/interviews
- **Storage**: File system (Electron) / IndexedDB (Web)
- **Dependencies**: None

### Agent Domain (AI)
- **Purpose**: AI-powered features for document editing and content generation
- **Service Interface**: `IAgentService`
- **Key Operations**: summarize, rewrite, expand, translate, brainstorm, outline
- **Capabilities**: Task execution, streaming, task history
- **Dependencies**: Documents (for context)

### Notifications Domain
- **Purpose**: Cross-platform user notifications
- **Service Interface**: `INotificationService`
- **Key Operations**: show, showSuccess, showError, showInfo, permission management
- **Platform Behavior**: Native notifications (Electron) / Web Notifications API (Web)
- **Dependencies**: None

## Package Structure

```
/
├── AGENTS.md                       # Agent navigation map (you are here via it)
├── ARCHITECTURE.md                 # This file
├── README.md                       # Human-facing project overview
├── package.json                    # Dependencies and scripts
├── docs/                           # Structured documentation
│   ├── design-docs/                # Architectural decisions
│   ├── product-specs/              # Feature specifications
│   ├── exec-plans/                 # Execution plans
│   ├── references/                 # LLM-optimized reference docs
│   ├── generated/                  # Auto-generated docs
│   ├── guide/                      # Legacy setup/usage guides
│   ├── ai-feature-summary/        # Phase completion summaries
│   ├── DESIGN.md                   # Architectural patterns
│   ├── FRONTEND.md                 # Frontend conventions
│   ├── QUALITY_SCORE.md            # Quality tracking
│   ├── SECURITY.md                 # Security patterns
│   └── RELIABILITY.md              # Reliability patterns
├── src/
│   ├── App.tsx                     # Root component with routing
│   ├── main.tsx                    # Entry point with ServicesProvider
│   ├── types.ts                    # Shared TypeScript type definitions
│   ├── components/                 # React components (platform-agnostic)
│   │   ├── Dashboard.tsx           # Main dashboard view
│   │   ├── AIAssistant.tsx         # AI assistant interface
│   │   ├── StoriesPage.tsx         # Story management
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   │   ├── ProgressChart.tsx       # Progress visualization
│   │   ├── DailyTasks.tsx          # Task management
│   │   ├── documents/              # Document editor components
│   │   │   └── DocumentPage.tsx    # Document editing view
│   │   ├── onboarding/            # Onboarding flow
│   │   │   └── OnboardingFlow.tsx  # Multi-step onboarding
│   │   └── ui/                     # Reusable UI primitives (shadcn-style)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       └── dropdown-menu.tsx
│   ├── services/                   # Service Abstraction Layer ⭐
│   │   ├── interfaces.ts           # Service contracts (IDocumentService, etc.)
│   │   ├── factory.ts              # Platform detection & service creation
│   │   ├── context.tsx             # React context provider & hooks
│   │   ├── index.ts                # Public API exports
│   │   ├── electron/               # Electron implementations
│   │   │   ├── document.ts
│   │   │   ├── user.ts
│   │   │   ├── agent.ts
│   │   │   ├── notifications.ts
│   │   │   └── index.ts
│   │   └── web/                    # Web implementations
│   │       ├── document.ts
│   │       ├── user.ts
│   │       ├── agent.ts
│   │       ├── notifications.ts
│   │       └── index.ts
│   └── utils/
│       └── platform.ts             # Platform detection utilities
├── electron/                       # Electron main process
│   ├── main.ts                     # Main process entry
│   ├── preload.ts                  # Preload script (contextBridge)
│   └── storage.ts                  # File system storage
└── public/                         # Static assets
```

## Service Abstraction Pattern

### Contract-First Design
All service capabilities are defined as TypeScript interfaces in `src/services/interfaces.ts`. Both Electron and Web implementations must satisfy the same contract:

```typescript
// Service contracts
IDocumentService  → ElectronDocumentService / WebDocumentService
IUserService      → ElectronUserService     / WebUserService
IAgentService     → ElectronAgentService    / WebAgentService
INotificationService → ElectronNotificationService / WebNotificationService
```

### Platform Detection & Factory
The `factory.ts` module detects the current platform and creates the appropriate service instances:

```typescript
const platform = getPlatform(); // 'electron' | 'web'
const services = createServices(); // Returns IAppServices
```

### React Integration
Services are provided through React Context and consumed via hooks:

```typescript
// Available hooks (from src/services/context.tsx)
useServices()       // All services
useDocuments()      // IDocumentService
useUser()           // IUserService
useAgent()          // IAgentService
useNotifications()  // INotificationService
```

## Routing Architecture

- **Web**: `BrowserRouter` for standard URL-based routing
- **Electron**: `HashRouter` for `file://` protocol compatibility
- **Routes**: `/` (Dashboard), `/document/:id`, `/stories`, `/ai-assistant`, `/onboarding`
- **Protection**: `ProtectedRoute` wrapper checks onboarding completion

## Dependency Rules

### Cross-Domain
- Components may use multiple services (e.g., Dashboard uses Documents + User)
- Services should NOT import from other services directly
- Shared types live in `src/types.ts`
- Cross-cutting utilities live in `src/utils/`

### Platform Boundary
- Components NEVER import from `src/services/electron/` or `src/services/web/` directly
- Components only interact with services via hooks from `src/services/context.tsx`
- Platform-specific code is strictly isolated in `src/services/{platform}/`

## Evolution Guidelines

### Adding a New Service
1. Define the interface in `src/services/interfaces.ts`
2. Add to `IAppServices` combined interface
3. Create `src/services/electron/{service}.ts` implementation
4. Create `src/services/web/{service}.ts` implementation
5. Register in `src/services/factory.ts`
6. Add hook in `src/services/context.tsx`
7. Export from `src/services/index.ts`
8. Update this document

### Adding a New Feature
1. Check `docs/product-specs/` for requirements
2. Determine which service domain(s) are affected
3. Add service methods to interface if needed
4. Implement for both platforms
5. Build UI components using service hooks
6. Update documentation

## Validation Commands

```bash
# Lint the codebase
npm run lint

# Type check
npx tsc --noEmit

# Development (web)
npm run dev

# Development (electron)
npm run electron:dev

# Production build
npm run build
```

## References

- See `docs/DESIGN.md` for architectural patterns and conventions
- See `docs/FRONTEND.md` for UI component patterns
- See `docs/QUALITY_SCORE.md` for quality expectations
- See `docs/SECURITY.md` for Electron security model
- See `docs/guide/ARCHITECTURE.md` for legacy architecture docs
- See `docs/guide/SERVICES_USAGE.md` for service usage examples
