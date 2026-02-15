# Design Decision: Service Abstraction Layer

**Status**: ✅ Current (verified 2026-02-14)

## Problem Statement

Mockvue needs to run as both an Electron desktop application and a web browser application using the same React codebase. Platform-specific APIs (file system, IPC, IndexedDB, Web APIs) must be abstracted so components remain platform-agnostic.

## Decision

Implement a **Service Abstraction Layer** using TypeScript interfaces with platform-specific implementations, provided to React components via Context.

### Architecture
```
Interfaces (contracts) → Factory (platform detection) → Context (React hooks)
                              ↙                ↘
              Electron Services          Web Services
```

## Rationale

- **Type Safety**: TypeScript interfaces guarantee both platforms implement the same API
- **Single Codebase**: Components written once work everywhere
- **Testability**: Services can be easily mocked in tests
- **Extensibility**: New platforms (mobile, etc.) just need new implementations
- **Separation of Concerns**: Platform details isolated from business logic

## Alternatives Considered

1. **Conditional imports per component**: Rejected — scatters platform logic throughout the codebase, hard to maintain
2. **Separate codebases per platform**: Rejected — doubles maintenance, divergent features
3. **Abstract base classes**: Rejected — interfaces are lighter and more flexible in TypeScript
4. **Plugin architecture**: Considered for future — current service pattern is simpler for 2 platforms

## Implementation

### Service Contracts (`src/services/interfaces.ts`)
- `IDocumentService` — Document CRUD and search
- `IUserService` — Profile, onboarding, stories, interviews
- `IAgentService` — AI features and task management
- `INotificationService` — Cross-platform notifications
- `IAppServices` — Combined service container

### Factory (`src/services/factory.ts`)
- Detects platform via `getPlatform()`
- Creates appropriate service instances
- Singleton pattern for app-wide services

### Context (`src/services/context.tsx`)
- `ServicesProvider` wraps the app
- Individual hooks: `useDocuments()`, `useUser()`, `useAgent()`, `useNotifications()`

### Platform Implementations
- `src/services/electron/` — Uses IPC + Node.js via contextBridge
- `src/services/web/` — Uses IndexedDB + Browser APIs

## Verification Status
- [x] Implemented (Phase 1-3 complete)
- [x] Documented
- [ ] Tests passing (test infrastructure not yet set up)
