# Architectural Patterns & Conventions

**Version**: 1.0.0  
**Last Updated**: 2026-02-14

This document describes the architectural patterns, conventions, and constraints used throughout the Mockvue codebase. For the system-wide architecture overview, see `ARCHITECTURE.md` in the repo root.

## Core Pattern: Service Abstraction

The foundational pattern in Mockvue is the **Service Abstraction Layer**. See `docs/design-docs/service-abstraction.md` for the full design decision.

### The Pattern
```
Interface (contract) → Factory (platform switch) → Context (React hook) → Component
```

### Rules
1. **All platform operations go through service interfaces** — Never call `window.electronAPI` or `IndexedDB` directly from components
2. **Factory handles platform detection** — Done once at app startup in `src/services/factory.ts`
3. **Context provides services** — Components access services via hooks from `src/services/context.tsx`
4. **Implementations are isolated** — Electron code in `services/electron/`, Web code in `services/web/`

## State Management

### Current Approach: Local State + Service Hooks
- Component-local state via `useState` and `useEffect`
- Service data fetched via hooks and stored in component state
- No global state management library (Redux, Zustand, etc.)

### Pattern
```typescript
function DocumentPage() {
  const documents = useDocuments();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documents.getDocument(id).then(setDoc).finally(() => setLoading(false));
  }, [id]);
}
```

### When to Evolve
Consider adding a state management library when:
- Multiple components need the same data simultaneously
- Optimistic updates become complex
- Cache invalidation becomes a problem
- Real-time sync is needed

## Routing

### Pattern: Platform-Adaptive Router
```typescript
const Router = isElectron() ? HashRouter : BrowserRouter;
```

- **Web**: `BrowserRouter` (clean URLs like `/document/123`)
- **Electron**: `HashRouter` (works with `file://` protocol: `/#/document/123`)

### Route Protection
`ProtectedRoute` component checks onboarding completion before rendering:
```typescript
<Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

## Component Patterns

### Page Components
Top-level route components in `src/components/`:
- Fetch data from services
- Manage page-level state
- Compose smaller components
- Handle loading/error states

### Feature Components
Domain-specific components in subdirectories:
- `src/components/documents/` — Document editing
- `src/components/onboarding/` — Onboarding flow

### UI Primitives
Reusable, headless-style components in `src/components/ui/`:
- Based on shadcn/ui patterns (Radix UI + Tailwind)
- Compose with `className` prop and `cn()` utility
- Use `class-variance-authority` for variants

### Pattern: cn() Utility for Class Merging
```typescript
import { cn } from '@/utils/cn'; // or wherever it's defined

<div className={cn("base-classes", conditional && "conditional-class", className)} />
```

## Error Handling

### Current State
- Try/catch in async service calls
- Console.error for logging
- Basic loading states in components

### Target Pattern
```typescript
async function loadDocument(id: string) {
  try {
    setLoading(true);
    const doc = await documents.getDocument(id);
    if (!doc) {
      setError('Document not found');
      return;
    }
    setDoc(doc);
  } catch (error) {
    console.error('Failed to load document:', error);
    setError('Failed to load document. Please try again.');
  } finally {
    setLoading(false);
  }
}
```

## File Organization Conventions

### Naming
- React components: `PascalCase.tsx` (e.g., `DocumentPage.tsx`)
- Services/utilities: `camelCase.ts` (e.g., `factory.ts`, `platform.ts`)
- Types: In `src/types.ts` or colocated `*.types.ts`
- UI primitives: `lowercase.tsx` (e.g., `button.tsx`, `card.tsx`) — shadcn convention

### Import Conventions
```typescript
// React/library imports first
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Service/hook imports
import { useDocuments } from '../services';

// Component imports
import { Button } from './ui/button';

// Type imports
import type { Document } from '../types';

// Utility imports
import { cn } from '../utils';
```

## TypeScript Conventions

### Strict Mode
All TypeScript configs have `strict: true`:
- `tsconfig.json` — Main app
- `tsconfig.electron.json` — Electron main process
- `tsconfig.node.json` — Node/Vite config

### Type Definitions
- Shared types in `src/types.ts`
- Service interfaces in `src/services/interfaces.ts`
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use `import type` for type-only imports

### No Loose Typing
```typescript
// ✅ CORRECT
function processDoc(doc: Document): DocumentData { ... }

// ❌ AVOID
function processDoc(doc: any): any { ... }
```

## Build System

### Vite Configuration
- `vite.config.ts` — Main build config
- React plugin: `@vitejs/plugin-react`
- Path aliases: `@/` maps to `src/`

### Electron Build Pipeline
```bash
npm run build                    # TypeScript compile + Vite build + Electron compile
npm run build:electron           # Just Electron main process
npm run electron:build           # Full build + electron-builder
```

### Output
- `dist/` — Web build output
- `dist-electron/` — Electron main process output
- `release/` — Electron installers

## References

- `ARCHITECTURE.md` — System-wide architecture
- `docs/design-docs/core-beliefs.md` — Foundational principles
- `docs/FRONTEND.md` — Frontend-specific patterns
- `docs/guide/SERVICES_USAGE.md` — Service usage examples
