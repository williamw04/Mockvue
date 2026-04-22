# Contributing to Mockvue

## 1. Setting Up

### Prerequisites

- Node.js 20+
- npm

### Install & Run

```bash
npm install
npm run electron:dev
```

This compiles the Electron TypeScript files, starts the Vite dev server, and launches the desktop app with hot-reload.

### Build for Production

```bash
npm run build                # Full build (TypeScript + Vite + Electron)
npm run electron:build       # Build + create installer
```

### Lint & Type Check

```bash
npm run lint                 # ESLint (--max-warnings 0)
npm run typecheck            # TypeScript strict mode check
```

### Run Tests

```bash
npm test                     # Run all tests once
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
```

CI runs automatically on push to `main` and on all PRs (lint, typecheck, test, build).

## 2. Navigating the Codebase

### Architecture

Mockvue uses a **Service Abstraction Layer**. React components never call platform APIs directly -- they use service hooks.

```
React Components (Platform Agnostic)
         |
Service Abstraction Layer (src/services/interfaces.ts)
         |
Electron Services (src/services/electron/)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full domain map and package structure.

### Code Standards

- **TypeScript strict mode** -- no `any` types without justification
- **ESLint** with zero warnings policy (`--max-warnings 0`)
- **Prettier** for formatting
- Service contracts defined in `src/services/interfaces.ts`
- Shared types in `src/types.ts`
- Component patterns and styling conventions in [docs/FRONTEND.md](./docs/FRONTEND.md)

### Key Directories

| Directory                    | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `src/components/`            | React page and feature components                             |
| `src/components/ui/`         | Reusable UI primitives (shadcn/ui)                            |
| `src/components/onboarding/` | 5-step onboarding flow                                        |
| `src/components/profile/`    | Resume Architect sub-components                               |
| `src/services/`              | Service interfaces, factory, React context                    |
| `src/services/electron/`     | Electron implementations                                      |
| `electron/`                  | Electron main process, IPC handlers, agent runtime            |
| `electron/agent/`            | Gemini agent: runtime, tools, prompts, memory, coaching store |

### Documentation

| Document                                                 | Content                                                  |
| -------------------------------------------------------- | -------------------------------------------------------- |
| [docs/PRODUCT_VISION.md](./docs/PRODUCT_VISION.md)       | What Mockvue is, who it's for                            |
| [docs/FEATURE_PURPOSES.md](./docs/FEATURE_PURPOSES.md)   | Why each feature exists, user stories                    |
| [docs/FRONTEND.md](./docs/FRONTEND.md)                   | Design system, colors, typography, component patterns    |
| [docs/DESIGN.md](./docs/DESIGN.md)                       | Architectural patterns, state management, error handling |
| [docs/SECURITY.md](./docs/SECURITY.md)                   | Electron security model and requirements                 |
| [docs/tech-debt-tracker.md](./docs/tech-debt-tracker.md) | Known technical debt                                     |

## 3. Creating Features

Each feature has its own folder in `docs/features/<feature-name>/` containing:

- **`product-spec.md`** -- What the feature does, user requirements, acceptance criteria, open questions
- **`exec-plan.md`** -- Phased delivery plan with checkboxes tracking progress
- **`design.md`** (optional) -- Technical design for complex features (see below)

### Feature Development Workflow

**Step 1: Brainstorm** -- Discuss the feature's purpose, scope, and constraints. Understand the user story.

**Step 2: Product Spec** -- Create `docs/features/<feature-name>/product-spec.md` with purpose, user story, requirements, open questions, and acceptance criteria. Iterate until the spec is solid.

**Step 3: Exec Plan** -- Create `docs/features/<feature-name>/exec-plan.md` with phased tasks using checkboxes:

```markdown
## Phase 1: Service Layer

- [ ] Define interface methods in `src/services/interfaces.ts`
- [ ] Implement Electron service in `src/services/electron/`
- [ ] Write service tests

## Phase 2: UI

- [ ] Build page component
- [ ] Add route
- [ ] Write component tests
```

**Step 4: Design Document** (for complex features) -- Create `docs/features/<feature-name>/design.md` with three layers:

- **Layer 1: High-Level Architecture** -- Components and their relationships, entry points (APIs, UI routes, service methods). List files to create/modify and how they connect.
- **Layer 2: Component Specification** -- For each module: responsibility, inputs, outputs, key behaviors, dependencies, constraints, assumptions.
- **Layer 3: Discoveries** -- Captured during/after implementation: non-obvious decisions, algorithms, trade-offs, edge cases.

**Step 5: Implement & Test** -- Follow the exec plan phases. Update checkboxes as work progresses.

### Feature Index

See [docs/features/index.md](./docs/features/index.md) for the full list of features and their status.

## 4. PR Guidelines

### Before Submitting

- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] Documentation updated if applicable
- [ ] Feature exec plan updated with progress

### PR Template

Use the template in `.github/pull_request_template.md`. Include:

- Description of changes
- Type of change (bug fix, feature, refactor, etc.)
- Testing performed
- Related issues

### Commit Messages

Use clear, descriptive commit messages that explain the "why" not the "what".

## 5. Testing

### Test Infrastructure

- **Vitest** as test runner with jsdom environment
- **React Testing Library** for component tests
- **@vitest/coverage-v8** for coverage reports
- Test setup in `src/test/setup.ts`
- Test utilities in `src/test/test-utils.tsx` (renderWithProviders, mock services)
- Mock services in `src/test/mock-services.ts`

### Writing Tests

**Service tests**: Test against the interface contract. Mock platform-specific dependencies.

```typescript
import { renderWithProviders } from '../test/test-utils';

// Services are mocked automatically via mock-services.ts
```

**Component tests**: Use `renderWithProviders` which wraps components with the service context and router.

```typescript
import { renderWithProviders } from '../test/test-utils';
import { screen } from '@testing-library/react';

it('renders document title', async () => {
  renderWithProviders(<MyComponent />);
  expect(await screen.findByText('Expected Text')).toBeInTheDocument();
});
```

### Running Tests

```bash
npm test                # All tests
npm run test:watch      # Watch mode (good during development)
npm run test:coverage   # Generate coverage report in coverage/
```

## 6. Features Directory

The [docs/features/](./docs/features/) directory contains per-feature documentation:

| Feature                    | Folder                        | Status                    |
| -------------------------- | ----------------------------- | ------------------------- |
| User Onboarding            | `user-onboarding/`            | Built                     |
| Dashboard                  | `dashboard/`                  | Needs rewrite             |
| Resume Architect           | `resume-architect/`           | Built, actively improving |
| Core Stories               | `core-stories/`               | Built, needs redesign     |
| Prep Sheets                | `prep-sheets/`                | In progress               |
| Practice Tools             | `practice-tools/`             | Planned                   |
| Company Question Ingestion | `company-question-ingestion/` | In progress               |

See [docs/features/index.md](./docs/features/index.md) for the full index.
