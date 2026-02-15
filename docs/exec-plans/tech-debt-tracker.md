# Tech Debt Tracker

**Last Updated**: 2026-02-14  
**Review Frequency**: Monthly

This document tracks known technical debt, prioritization, and remediation plans.

## Critical (P0)

### No Test Infrastructure
- **Description**: No test framework configured. Zero test coverage across all domains.
- **Impact**: Cannot verify correctness of service implementations, risk of regressions
- **Remediation**: Set up Vitest + React Testing Library
- **Effort**: Medium (1-2 days)
- **Status**: Not started

### No CI/CD Pipeline
- **Description**: No automated checks on pull requests (lint, type check, tests)
- **Impact**: Quality regressions can merge uncaught
- **Remediation**: Set up GitHub Actions with lint + typecheck + test jobs
- **Effort**: Small (half day)
- **Status**: Not started

## High Priority (P1)

### DEV Mode Onboarding Bypass
- **Description**: `App.tsx` auto-completes onboarding in what appears to be a permanent dev bypass (not behind env flag)
- **Location**: `src/App.tsx` lines 28-42
- **Impact**: Could accidentally ship to production, makes it hard to test real onboarding
- **Remediation**: Move behind `import.meta.env.DEV` or `VITE_SKIP_ONBOARDING` env variable
- **Effort**: Small

### Missing Product Specifications
- **Description**: No formal product specs exist for any feature
- **Impact**: Agents and developers lack clear requirements; features may drift
- **Remediation**: Create specs in `docs/product-specs/` for each domain
- **Effort**: Medium (1-2 hours per spec)
- **Status**: Not started

### No Prettier Configuration
- **Description**: No code formatter configured. Inconsistent formatting possible across contributors.
- **Impact**: Code style inconsistencies, noisy diffs
- **Remediation**: Add Prettier with consistent config
- **Effort**: Small

## Medium Priority (P2)

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

_No items resolved yet._

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
