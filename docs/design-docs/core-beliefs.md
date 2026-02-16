# Core Beliefs

**Version**: 1.0  
**Last Updated**: 2026-02-14

These are the foundational principles that guide all architectural and design decisions in Mockvue. They are mechanically enforced where possible and culturally reinforced where not.

## 1. Repository as System of Record

**Belief**: If knowledge isn't in the repository, it doesn't exist.

**Implications**:
- All design decisions documented in `docs/design-docs/`
- All product requirements in `docs/product-specs/`
- All execution plans in `docs/exec-plans/`
- No critical information in Slack, Google Docs, or tribal knowledge

**Enforcement**:
- PR template requires documentation links
- Architectural decisions must be in-repo before implementation

## 2. Platform Agnosticism Through Abstraction

**Belief**: UI components should never know which platform they're running on. Platform-specific code belongs behind service interfaces.

**Implications**:
- All platform operations go through `src/services/interfaces.ts`
- Components use hooks (`useDocuments()`, `useUser()`, etc.) not direct APIs
- No `window.electronAPI` calls in components
- No `IndexedDB` calls in components

**Examples**:
```typescript
// ✅ CORRECT: Use service hooks
const documents = useDocuments();
const docs = await documents.getDocuments();

// ❌ WRONG: Direct platform API
const docs = await window.electronAPI.getDocuments();
```

**Enforcement**:
- ESLint: flag `window.electronAPI` usage outside `src/services/electron/`
- Code review: verify all platform calls go through services

## 3. Contract-First Service Design

**Belief**: Define the interface before the implementation. Service contracts are the source of truth.

**Implications**:
- `src/services/interfaces.ts` defines all capabilities
- Both Electron and Web implementations must satisfy the same interface
- Adding a feature starts with updating the interface
- TypeScript enforces contract compliance at compile time

**Examples**:
```typescript
// ✅ CORRECT: Start with the interface
export interface IDocumentService {
  getDocuments(): Promise<Document[]>;
  createDocument(data: DocumentData): Promise<Document>;
  // ...
}

// Then implement for each platform
class WebDocumentService implements IDocumentService { ... }
class ElectronDocumentService implements IDocumentService { ... }
```

## 4. Explicit Over Implicit

**Belief**: No magic. All behavior should be obvious from reading the code.

**Implications**:
- No global state mutations without explicit context
- Dependencies are injected via React Context, not globals
- Configuration is explicit and documented
- Platform detection is done once in the factory, not scattered throughout

**Examples**:
```typescript
// ✅ CORRECT: Explicit dependency via context
const { documents, user } = useServices();

// ❌ WRONG: Hidden global
import { db } from './database'; // Where is this configured?
```

## 5. TypeScript Strict Mode Always

**Belief**: Type safety prevents entire classes of bugs. Strict mode is non-negotiable.

**Implications**:
- `strict: true` in tsconfig.json
- No `any` types without justification
- All service interfaces fully typed
- Shared types in `src/types.ts`

**Enforcement**:
- TypeScript compiler in strict mode
- ESLint `@typescript-eslint/recommended` rules
- `noUnusedLocals`, `noUnusedParameters` enabled

## 6. Shared Utilities Over Duplication

**Belief**: Common patterns belong in shared modules, not duplicated across components.

**Implications**:
- Utility functions in `src/utils/`
- Reusable UI primitives in `src/components/ui/`
- Platform detection centralized in `src/utils/platform.ts`
- Extract patterns after 2nd use (Rule of Three)

## 7. Progressive Enhancement

**Belief**: The app should work with basic capabilities and enhance when advanced features are available.

**Implications**:
- Web version works without Electron APIs
- Notifications fall back gracefully when permission denied
- File operations degrade from native dialogs to browser downloads
- Offline support via IndexedDB / file system

## 8. Documentation is Code

**Belief**: Documentation should be versioned, reviewed, and maintained like code.

**Implications**:
- All docs in repository (no external wikis)
- Docs updated in same PR as code changes
- Product specs for all features
- Design docs for all architectural decisions

## 9. Optimize for Deletion

**Belief**: The best code is no code. Make things easy to remove.

**Implications**:
- Clear service boundaries (easy to swap implementations)
- Domain isolation (easy to remove a feature)
- Minimal coupling between components
- Service factory pattern (easy to add/remove services)

## 10. Test Coverage Reflects Criticality

**Belief**: Higher-risk code deserves higher test coverage.

**Coverage Targets**:
- Service interfaces/contracts: 100% (must be correct)
- Service implementations: 90% (business logic)
- Components: 70% (presentation logic)
- Utilities: 95% (shared code must be reliable)

**Note**: Test infrastructure is not yet set up. This is tracked in `docs/exec-plans/tech-debt-tracker.md`.

## Application of Beliefs

### When Designing Features
1. Which service domain does this belong to?
2. Does the interface need to change? (`src/services/interfaces.ts`)
3. Does this work on both platforms?
4. Where will this be documented? (`docs/product-specs/`)

### When Writing Code
1. Is this platform-agnostic? (No direct platform calls in components)
2. Is the interface explicit? (Contract-first)
3. Could this be a shared utility? (No duplication)
4. Is this type-safe? (Strict TypeScript)

### When Reviewing Code
1. Are service contracts followed? (Interface compliance)
2. Is platform code isolated? (Only in `services/{platform}/`)
3. Is documentation updated? (Docs are code)
4. Are types correct? (No `any`, no loose typing)

## Evolution

These beliefs evolve as we learn. To update:
1. Propose change in `docs/design-docs/`
2. Update this document
3. Update enforcement mechanisms if applicable
