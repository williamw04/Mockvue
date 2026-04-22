# Security Patterns

**Version**: 1.0.0  
**Last Updated**: 2026-02-14

This document describes the security model, patterns, and requirements for Mockvue.

## Electron Security Model

Mockvue follows Electron security best practices with a defense-in-depth approach.

### Context Isolation

```typescript
// electron/main.ts
webPreferences: {
  contextIsolation: true,    // Renderer isolated from Node.js
  nodeIntegration: false,     // No Node.js in renderer process
  sandbox: true,              // Sandboxed renderer
}
```

### Context Bridge (Preload Script)

Only approved APIs are exposed to the renderer via `contextBridge`:

```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  getDocuments: () => ipcRenderer.invoke('get-documents'),
  createDocument: (data) => ipcRenderer.invoke('create-document', data),
  // ... only explicitly approved operations
});
```

### IPC Security Rules

1. **Use `invoke`/`handle` pattern** — Not `send`/`on` (invoke provides return values and error handling)
2. **Validate all IPC inputs** — Main process validates data before acting
3. **Minimize exposed APIs** — Only expose what components need
4. **No arbitrary code execution** — No `eval()`, no `Function()` constructor

## Data Security

### Local Storage

- **Electron**: Documents stored in app data directory (`~/Library/Application Support/Mockvue/`)
- Avoid sensitive data in `localStorage` (5MB limit, synchronous, no encryption)

### Data Validation

- TypeScript types enforce data shapes at compile time
- Service interfaces define explicit input/output types
- Invalid data should be rejected, not coerced

### Future Requirements

When backend/cloud sync is added:

- [ ] All API calls over HTTPS
- [ ] Input sanitization on all user-provided data
- [ ] Rate limiting on API endpoints
- [ ] Authentication tokens with expiration
- [ ] Audit logging on sensitive operations

## Platform Boundary Security

### Rule: Components Never Access Platform APIs Directly

```typescript
// ✅ Secure: Through service abstraction
const docs = useDocuments();
await docs.createDocument(data);

// ❌ Insecure: Direct platform access
await window.electronAPI.createDocument(data); // Bypasses abstraction
```

### Why This Matters

- Service layer can add validation, logging, sanitization
- Platform code is auditable in one location (`services/{platform}/`)
- Easier to add security measures uniformly

## Dependency Security

### Guidelines

- Keep dependencies minimal and up-to-date
- Review new dependencies before adding
- Prefer well-maintained libraries with active security response
- Run `npm audit` periodically

### Current Dependencies (Security-Relevant)

- **Electron 28** — Keep updated for security patches
- **React 18** — XSS protection built-in (JSX escaping)
- **Radix UI** — Accessibility-safe, no XSS vectors

## Content Security

### XSS Prevention

- React's JSX auto-escapes content by default
- Never use `dangerouslySetInnerHTML` without sanitization
- Document content is stored as structured data, not raw HTML

### Future: Content Security Policy (CSP)

Add CSP headers to production builds:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
```

## Electron Implementation Patterns

Model knowledge about Electron is often outdated. These are the patterns Mockvue uses.

### IPC Handler Registry

Instead of repetitive try-catch blocks in `main.ts`, use the `registerIpcHandlers` utility from `electron/ipc-utils.ts`:

```typescript
import { registerIpcHandlers, createHandler } from './ipc-utils';

registerIpcHandlers(ipcMain, [
  createHandler('get-user-profile', () => storage.getUserProfile()),
  createHandler('save-user-profile', (_, profile) => storage.saveUserProfile(profile)),
]);
```

### File System Operations

Use async `fs.promises` API, never synchronous operations (they block the main process):

```typescript
import { promises as fs } from 'fs';

async function readFileSafe(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}
```

### Path Validation

Always validate paths before passing to `shell.openPath()` or similar:

```typescript
const userDataPath = app.getPath('userData');
const allowedDir = path.resolve(path.join(userDataPath, 'user-data', 'resumes'));
const resolvedPath = path.resolve(inputPath);

if (!resolvedPath.startsWith(allowedDir)) {
  throw new Error('Invalid path: must be within allowed directory');
}
```

### Agent Runtime

The agent is in `electron/agent/`:

- `runtime.ts` -- `AgentRuntime` class
- `model.ts` -- Gemini integration + tool-calling loop
- `tools.ts` -- 16 tool definitions + executor
- `prompts.ts` -- System prompts per assistant type
- `knowledge.ts` -- `ResumeDoc` builder (normalized read model)
- `memory-store.ts` -- Session/message/memory persistence
- `coaching-store.ts` -- Goals, todos, changes, versions
- `logger.ts` -- Opt-in file-based logging (API keys auto-redacted)

When adding agent capabilities: define the tool in `tools.ts`, add the handler, update the system prompt in `prompts.ts` if needed.

## References

- Electron Security Best Practices: https://www.electronjs.org/docs/latest/tutorial/security
- `ARCHITECTURE.md` — Platform architecture overview
