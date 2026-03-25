# Tech Debt Tracker

**Last Updated**: 2026-03-25  
**Review Frequency**: Monthly  

This document tracks known technical debt, prioritization, and remediation plans.

## Critical (P0)

### ~~No Test Infrastructure~~ → Resolved
- **Description**: No test framework configured. Zero test coverage across all domains.
- **Impact**: Cannot verify correctness of service implementations, risk of regressions
- **Remediation**: Set up Vitest + React Testing Library
- **Effort**: Medium (1-2 days)
- **Status**: Resolved (2026-02-14) — Vitest + RTL configured, 53 tests passing

### ~~No CI/CD Pipeline~~ → Resolved
- **Description**: No automated checks on pull requests (lint, type check, tests)
- **Impact**: Quality regressions can merge uncaught
- **Remediation**: Set up GitHub Actions with lint + typecheck + test jobs
- **Effort**: Small (half day)
- **Status**: Resolved (2026-02-14) — `.github/workflows/ci.yml` with lint, typecheck, test, build jobs

### ~~Sensitive Data Logging~~ → Resolved
- **Description**: API keys and resume content logged to console in production code
- **Location**: `electron/parser.ts`, `electron/agent/model.ts`
- **Impact**: PII exposure in logs, security vulnerability
- **Remediation**: Remove sensitive logging statements
- **Status**: Resolved (2026-03-25) — Removed all sensitive logging, added safe file-based logging system

### ~~Path Traversal Vulnerability~~ → Resolved
- **Description**: `shell.openPath()` accepted arbitrary file paths without validation
- **Location**: `electron/main.ts`
- **Impact**: Could open arbitrary files on user's system
- **Remediation**: Validate paths are within expected directories
- **Status**: Resolved (2026-03-25) — Added path validation for resumes directory

## High Priority (P1)

### DEV Mode Onboarding Bypass
- **Description**: `App.tsx` auto-completes onboarding in what appears to be a permanent dev bypass (not behind env flag)
- **Location**: `src/App.tsx` lines 28-42
- **Impact**: Could accidentally ship to production, makes it hard to test real onboarding
- **Remediation**: Move behind `import.meta.env.DEV` or `VITE_SKIP_ONBOARDING` env variable
- **Effort**: Small

### ~~Missing Product Specifications~~ → Resolved
- **Description**: No formal product specs exist for any feature
- **Impact**: Agents and developers lack clear requirements; features may drift
- **Remediation**: Create specs in `docs/product-specs/` for each domain
- **Effort**: Medium (1-2 hours per spec)
- **Status**: Resolved (2026-02-14) — 9 product specs created in `docs/product-specs/`

### ~~Type Definition Duplication~~ → Resolved
- **Description**: Entity types (UserProfile, Resume, Story) defined in multiple files
- **Location**: `src/types.ts`, `electron/preload.ts`, `electron/storage.ts`, `electron/internal-types.ts`
- **Impact**: Maintenance burden, risk of type drift
- **Remediation**: Consolidate to single source
- **Status**: Resolved (2026-03-25) — Types consolidated in `electron/internal-types.ts`

### ~~Oversized IAgentService Interface~~ → Resolved
- **Description**: `IAgentService` had 20+ methods mixing concerns (task execution, resume parsing, session management)
- **Location**: `src/services/interfaces.ts`
- **Impact**: Violates Interface Segregation Principle
- **Remediation**: Split into focused interfaces
- **Status**: Resolved (2026-03-25) — Split into `ITaskExecutionService`, `IResumeService`, `IAssistantSessionService`

### No Prettier Configuration
- **Description**: No code formatter configured. Inconsistent formatting possible across contributors.
- **Impact**: Code style inconsistencies, noisy diffs
- **Remediation**: Add Prettier with consistent config
- **Effort**: Small

## Medium Priority (P2)

### ~~Duplicate Loading Spinner Implementations~~ → Resolved
- **Description**: 6+ nearly identical loading spinner implementations across components
- **Location**: Dashboard, ProfilePage, StoriesPage, DocumentPage, App, ResumeReviewPage
- **Impact**: Code duplication, inconsistent behavior risk
- **Remediation**: Extract reusable component
- **Status**: Resolved (2026-03-25) — Created `src/components/ui/LoadingSpinner.tsx`

### ~~Repetitive IPC Handler Boilerplate~~ → Resolved
- **Description**: `electron/main.ts` was 727 lines with repetitive try-catch IPC handlers
- **Location**: `electron/main.ts`
- **Impact**: Hard to maintain, easy to introduce inconsistencies
- **Remediation**: Create handler registry pattern
- **Status**: Resolved (2026-03-25) — Created `electron/ipc-utils.ts`, reduced main.ts to 354 lines

### ~~Dead Code in Agent Service~~ → Resolved
- **Description**: Unimplemented stub methods (`useLocalModel`, `cacheToFileSystem`) and commented-out code
- **Location**: `src/services/electron/agent.ts`
- **Impact**: Confusing for contributors, dead code
- **Remediation**: Remove unused methods
- **Status**: Resolved (2026-03-25) — Removed stub methods and dead code

### Legacy `useElectron` Hook
- **Description**: `src/hooks/useElectron.ts` is a legacy hook that was replaced by the service abstraction layer
- **Impact**: Confusing for new contributors, dead code
- **Remediation**: Remove the file and any references
- **Effort**: Small

### No Error Boundaries
- **Description**: No React Error Boundaries around major UI sections
- **Impact**: Unhandled errors crash entire app instead of individual sections
- **Remediation**: Add ErrorBoundary components around routes
- **Effort**: Small

### Missing Path Aliases
- **Description**: Imports use relative paths (`../../services`) instead of aliases (`@/services`)
- **Impact**: Harder to read, fragile when moving files
- **Remediation**: Configure `@/` alias in Vite and TypeScript configs
- **Effort**: Medium (need to update all imports)

## Low Priority (P3)

### Switch to Async File Operations
- **Description**: `electron/storage.ts` uses synchronous file operations (`fs.readFileSync`, `fs.writeFileSync`)
- **Impact**: Blocks main process, could cause UI freezes on large files
- **Remediation**: Switch to `fs.promises` async API

### No Performance Monitoring
- **Description**: No automated performance tracking or regression detection
- **Remediation**: Add Performance API marks for key operations
- **Effort**: Medium

### No Accessibility Audit
- **Description**: While Radix UI provides good defaults, no formal a11y audit has been done
- **Remediation**: Run axe-core audit, fix issues
- **Effort**: Medium

### Documentation Freshness Automation
- **Description**: No automated checks for stale documentation
- **Remediation**: Script to check "Last Updated" dates in docs
- **Effort**: Small

## Resolved

### Sensitive Data Logging (2026-03-25)
- Removed API key logging from `electron/parser.ts`
- Removed prompt/response logging from `electron/parser.ts` and `electron/agent/model.ts`
- Added `electron/agent/logger.ts` for safe, opt-in file-based logging
- Added `npm run electron:dev:logged` convenience script

### Path Traversal Vulnerability (2026-03-25)
- Added path validation in `shell.openPath()` handler
- Validates paths are within `user-data/resumes` directory
- Throws error for invalid paths

### Type Definition Consolidation (2026-03-25)
- Moved entity types to `electron/internal-types.ts`
- `electron/storage.ts` now imports from internal-types
- Eliminated duplicate definitions across 4 files

### Interface Segregation (2026-03-25)
- Split `IAgentService` into three focused interfaces:
  - `ITaskExecutionService` - task execution and streaming
  - `IResumeService` - resume parsing and analysis
  - `IAssistantSessionService` - session management
- `IAgentService` extends all three for backward compatibility

### Error Handling Standardization (2026-03-25)
- Created `src/services/errors.ts` with `ServiceError` class
- Typed error codes: `UNAVAILABLE`, `NOT_FOUND`, `VALIDATION_ERROR`, etc.
- Updated `ElectronDocumentService` to use standardized errors

### LoadingSpinner Component (2026-03-25)
- Created `src/components/ui/LoadingSpinner.tsx`
- Replaced 6 duplicate implementations
- Supports configurable message, size, and fullScreen props

### IPC Handler Registry (2026-03-25)
- Created `electron/ipc-utils.ts` with `registerIpcHandlers` utility
- Reduced `electron/main.ts` from 727 to 354 lines
- Consistent error handling across all handlers

### Dead Code Removal (2026-03-25)
- Removed `useLocalModel()` stub from `src/services/electron/agent.ts`
- Removed `cacheToFileSystem()` stub
- Removed commented-out constructor parameters

### CI/CD Pipeline (2026-02-14)
- Created `.github/workflows/ci.yml` with 3 parallel jobs: lint & type check, test + coverage, build
- Runs on push to `main` and all PRs targeting `main`
- Uses concurrency groups to cancel stale runs
- Uploads coverage report as artifact (14-day retention)

### Test Infrastructure (2026-02-14)
- Installed Vitest 4, React Testing Library, jsdom, @vitest/coverage-v8
- Configured in `vite.config.ts` with jsdom environment and v8 coverage
- Created test setup (`src/test/setup.ts`), test utilities (`src/test/test-utils.tsx`), and mock services (`src/test/mock-services.ts`)
- Added `npm test`, `npm run test:watch`, `npm run test:coverage` scripts
- 53 tests passing: WebDocumentService (18), WebUserService (21), ServicesContext hooks (6), DocumentCard component (8)

### Product Specifications (2026-02-14)
- Created 9 product specs in `docs/product-specs/` covering all feature domains
- Updated index with status grouping (Complete, In Progress, Planned)

## Process

### Adding New Debt
1. Add entry under appropriate priority level
2. Include: description, location, impact, remediation, effort
3. Update "Last Updated" date

### Resolving Debt
1. Move entry to "Resolved" section
2. Add resolution date and PR link
3. Update quality scores if applicable

### Priority Definitions
- **P0**: Blocks quality improvement or causes active risk
- **P1**: Should be addressed this month
- **P2**: Address when convenient or when touching related code
- **P3**: Nice-to-have improvements
