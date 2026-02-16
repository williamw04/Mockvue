# Feature: Cross-Platform Support

**Status**: Complete  
**Last Updated**: 2026-02-14

## User Story

As a user, I want to use Mockvue as both a desktop application and a web app so that I can access my interview prep materials from any device.

## Overview

Mockvue runs on two platforms via a shared React codebase:
- **Electron**: Native desktop app with file system storage and native notifications
- **Web**: Browser-based app with localStorage/IndexedDB storage and Web Notifications API

Platform differences are abstracted behind TypeScript service interfaces, so UI components never interact with platform APIs directly.

## Acceptance Criteria

- [x] Same React UI renders on both Electron and Web
- [x] Service interfaces abstract all platform differences
- [x] Automatic platform detection at startup
- [x] Electron uses `HashRouter` (file:// compatible)
- [x] Web uses `BrowserRouter` (clean URLs)
- [x] Document storage works on both platforms
- [x] User data storage works on both platforms
- [x] Notifications work on both platforms
- [x] Build scripts for both targets

## Architecture

```
UI Components (platform-agnostic)
        │
   Service Interfaces (IDocumentService, IUserService, IAgentService, INotificationService)
        │
   ┌────┴────┐
   │         │
Electron   Web
Services   Services
   │         │
File System  localStorage
IPC Bridge   Web APIs
```

## Key Components

| Layer | Path | Responsibility |
|-------|------|----------------|
| Interfaces | `src/services/interfaces.ts` | TypeScript contracts for all services |
| Factory | `src/services/factory.ts` | Platform detection + service instantiation |
| Context | `src/services/context.tsx` | React context provider for services |
| Electron Services | `src/services/electron/` | IPC bridge implementations |
| Web Services | `src/services/web/` | localStorage/Web API implementations |
| Electron Main | `electron/main.ts` | Electron main process, IPC handlers |
| Electron Preload | `electron/preload.ts` | Secure bridge between main/renderer |
| Electron Storage | `electron/storage.ts` | File system storage engine |

## Service Interface Map

| Interface | Electron Implementation | Web Implementation |
|-----------|------------------------|-------------------|
| `IDocumentService` | IPC → file system JSON | localStorage |
| `IUserService` | IPC → file system JSON | localStorage |
| `IAgentService` | IPC → (future LLM) | Simulated responses |
| `INotificationService` | Electron Notification API | Web Notifications API |

## Platform Detection

```typescript
// src/services/factory.ts
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;
```

## Build & Run

| Command | Target |
|---------|--------|
| `npm run dev` | Web development server |
| `npm run build` | Web production build |
| `npm run electron:dev` | Electron development mode |
| `npm run electron:build` | Electron production build |

## Success Metrics

- Feature parity: 100% of UI features work on both platforms
- Zero platform-specific code in UI components
- Service interface compliance: All implementations pass same test suite (when tests exist)

## Design References

- See: `docs/design-docs/service-abstraction.md` — Service layer design decision
- See: `docs/design-docs/core-beliefs.md` — "Platform Agnosticism Through Abstraction"
- See: `docs/SECURITY.md` — Electron security model
- See: `ARCHITECTURE.md` — Full system architecture
