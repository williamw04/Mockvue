# Feature: Platform Architecture

**Status**: Complete
**Last Updated**: 2026-02-16

## Overview

Mockvue is originally architected as a desktop application using **Electron**.

## Architecture

```
UI Components (platform-agnostic)
        │
   Service Interfaces (IDocumentService, IUserService, IAgentService, INotificationService)
        │
        ▼
   Electron Services
        │
   File System
   IPC Bridge
```

## Key Components

| Layer | Path | Responsibility |
|-------|------|----------------|
| Interfaces | `src/services/interfaces.ts` | TypeScript contracts for all services |
| Factory | `src/services/factory.ts` | Service instantiation (Electron-only) |
| Context | `src/services/context.tsx` | React context provider for services |
| Electron Services | `src/services/electron/` | IPC bridge implementations |
| Electron Main | `electron/main.ts` | Electron main process, IPC handlers |
| Electron Storage | `electron/storage.ts` | File system storage engine |

## Service Interface Map

| Interface | Electron Implementation |
|-----------|------------------------|
| `IDocumentService` | IPC → file system JSON |
| `IUserService` | IPC → file system JSON |
| `IAgentService` | IPC → AI Agent Service |
| `INotificationService` | Electron Notification API |

## Build & Run

| Command | Target |
|---------|--------|
| `npm run electron:dev` | Electron development mode |
| `npm run electron:build` | Electron production build |

## Design References

- See: `docs/design-docs/service-abstraction.md` — Service layer design decision
- See: `docs/SECURITY.md` — Electron security model
- See: `ARCHITECTURE.md` — Full system architecture
