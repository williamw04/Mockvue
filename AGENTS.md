# Agent Operating Guide

**Version:** 4.0.0
**Last Updated:** 2026-04-22

This file contains rules that apply to every coding task, plus a loading table for domain-specific reference. Load only what you need.

For product context, see [docs/PRODUCT_VISION.md](./docs/PRODUCT_VISION.md). For contribution workflow, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Absolute Rules

These apply to every task regardless of domain:

1. **Use service hooks** -- never call `window.electronAPI` directly from components. Use hooks from `src/services/context.tsx`.
2. **Components never import from `src/services/electron/`** -- platform code is isolated.
3. **TypeScript strict mode** -- no `any` without justification. Use `import type` for type-only imports.
4. **Run validation before completing** -- `npm run lint` (zero warnings), `npm run typecheck`, `npm test`.
5. **No comments** unless explicitly requested.
6. **Error handling** -- use typed `ServiceError` from `src/services/errors.ts` with codes: `UNAVAILABLE`, `NOT_FOUND`, `VALIDATION_ERROR`, `PERMISSION_DENIED`, `NETWORK_ERROR`, `STORAGE_ERROR`, `UNKNOWN`.
7. **File naming** -- React components: `PascalCase.tsx`, services/utilities: `camelCase.ts`, UI primitives: `lowercase.tsx`.

---

## Loading Table

Before writing code, identify the affected domain and load the relevant reference.

| When working on...                                                                                                  | Load this                                           |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Service interfaces, state management, error handling, routing, component patterns, import conventions, build system | [docs/DESIGN.md](./docs/DESIGN.md)                  |
| Electron security, IPC handlers, preload script, file system operations, path validation, agent runtime structure   | [docs/SECURITY.md](./docs/SECURITY.md)              |
| UI components, styling, colors, typography, layout patterns, design system                                          | [docs/FRONTEND.md](./docs/FRONTEND.md)              |
| Service domains, package structure, dependency rules, routing architecture                                          | [ARCHITECTURE.md](./ARCHITECTURE.md)                |
| Feature specs, exec plans, progress tracking                                                                        | [docs/features/\<feature-name\>/](./docs/features/) |
| Feature development workflow (brainstorm → spec → 3-layer design docs)                                              | [CONTRIBUTING.md](./CONTRIBUTING.md) section 3      |

---

## Validation Commands

```bash
npm run lint          # Zero warnings required
npm run typecheck     # TypeScript strict mode
npm test              # All tests must pass
```
