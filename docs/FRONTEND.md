# Frontend Patterns & Conventions

**Version**: 3.0.0
**Last Updated**: 2026-04-14

This document covers frontend-specific patterns, UI conventions, and component guidelines for Mockvue.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript (strict mode) |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Component Library | Radix UI (headless) via shadcn/ui primitives |
| Icons | Lucide React |
| Routing | React Router v6 (HashRouter) |
| Drag & Drop | react-dnd |
| Class Utilities | clsx, tailwind-merge (via cn()), class-variance-authority |

## Design System

### Color Mode

**Light-mode only.** No dark mode, no `dark:` prefixes, no ThemeContext, no conditional theme logic.

### Navigation

**TopNavBar** (not a sidebar). Floating glassmorphic pill in top-right corner with dropdown menu.

```tsx
// Floating nav bar
<div className="backdrop-blur-xl rounded-2xl px-5 py-3 shadow-lg bg-white/30 border border-white/50">

// Dropdown menu
<div className="backdrop-blur-xl rounded-2xl p-3 w-64 shadow-xl bg-white/40 border border-white/60">
```

Current nav items: Home (`/`), Profile (`/profile`), Stories (`/stories`), Resume Review (`/resume-review`).

### Color Palette

#### Backgrounds

| Role | Class |
|------|-------|
| Page background | `bg-gray-100` |
| Card / Panel | `bg-surface` (#fafbfc) |
| Nested / hover | `bg-gray-50` / `hover:bg-gray-50` |
| Input background | `bg-surface` or `bg-white` |
| Nav bar | `bg-white/30 backdrop-blur-xl` (glassmorphism) |
| Nav dropdown | `bg-white/40 backdrop-blur-xl` |

#### Text

| Role | Class |
|------|-------|
| Heading / Primary | `text-gray-900` |
| Body / Secondary | `text-gray-600` |
| Muted / Tertiary | `text-gray-500` or `text-gray-400` |
| Placeholder | `placeholder-gray-400` |
| Link / Active | `text-blue-600` |

#### Borders

| Role | Class |
|------|-------|
| Card border | `border-gray-100` or `border-gray-200` |
| Input border | `border-gray-300` |
| Nav border | `border-white/50` or `border-white/60` |
| Active / focus | `ring-blue-500` or `border-blue-400` |
| Error | `border-red-200` with `bg-red-50` |
| Success | `border-green-200` with `bg-green-50` |
| Warning | `border-amber-200` with `bg-amber-50` |

#### Accent Colors

| Role | Value |
|------|-------|
| Primary action | `bg-blue-600 hover:bg-blue-700 text-white` |
| Primary icon | `text-blue-600` |
| Active nav item | `bg-blue-50 text-blue-600 font-medium` |
| Gradient accent | `bg-gradient-to-br from-blue-500 to-purple-600` (avatars, icons, feature CTAs) |
| Gradient banner | `bg-gradient-to-r from-blue-50 to-purple-50` (info cards, value propositions) |
| Destructive / Error | `text-red-600`, `bg-red-50 border-red-200` |
| Success | `text-green-600`, `bg-green-50 border-green-200` |

#### Status Colors (used in Resume Architect)

| Score Range | Color | Label |
|------------|-------|-------|
| >= 80 | `text-green-600 bg-green-50` | Excellent / Pass |
| >= 60 | `text-amber-600 bg-amber-50` | Good / Warning |
| < 60 | `text-red-600 bg-red-50` | Needs Work / Fail |

#### Custom Tailwind Colors

Defined in `tailwind.config.js`:
```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  surface: '#fafbfc',
}
```

### Typography

#### Font Stack
System font stack (defined in `src/index.css`):
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

#### Scale

| Element | Classes |
|---------|---------|
| Page title | `text-2xl sm:text-3xl font-bold` |
| Section heading | `text-lg sm:text-xl font-bold` or `font-semibold` |
| Card title | `text-sm font-bold` or `font-semibold` |
| Body text | `text-sm` or default |
| Meta / timestamps | `text-xs` or `text-[10px]` |
| Button text | `text-sm font-medium` or `text-sm font-semibold` |
| Tab labels | `text-xs sm:text-sm font-medium` |

### Border Radius

| Element | Class |
|---------|-------|
| Page-level cards | `rounded-2xl` |
| Nav bar | `rounded-2xl` |
| Feature cards / panels | `rounded-xl` |
| Item cards | `rounded-lg` |
| Buttons | `rounded-lg` |
| Inputs | `rounded-lg` |
| Badges / Status pills | `rounded-full` |
| Avatars / Icon containers | `rounded-full` |
| Tab pills | `rounded-full` |
| Score badges | `rounded-full` |

### Shadows

| Context | Class |
|---------|-------|
| Major cards (onboarding, empty states) | `shadow-xl` |
| Container cards (dashboard widgets, panels) | `shadow-lg` |
| Nav bar | `shadow-lg` |
| Nav dropdown | `shadow-xl` |
| Item cards default | no shadow or `shadow-sm` |
| Item cards hover | `hover:shadow-md` |
| Error boundary | `shadow-lg` |

### Transitions

All interactive elements use transitions:
```tsx
className="transition-colors"                    // buttons, links
className="transition-all"                       // cards with shadow/border changes
className="transition-all duration-300"          // animated reveals
className="transition-all duration-500 ease-out" // value proposition card reveal
```

### Spacing & Layout

#### Page Layout

```tsx
// Standard page with TopNavBar
<div className="min-h-screen bg-gray-100">
  <TopNavBar />
  <div className="container mx-auto p-4 sm:p-6 max-w-7xl pt-16 sm:pt-20">
    {/* Content */}
  </div>
</div>

// Centered content (onboarding, standalone pages)
<div className="pt-32 pb-12 px-6">
  <div className="max-w-4xl mx-auto">
    {/* Content */}
  </div>
</div>

// Editor with sidebar (Resume Architect coaching tab)
<div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[400px_1fr] gap-6">
  <div className="lg:sticky lg:top-20 lg:overflow-y-auto lg:max-h-[calc(100vh-200px)]">
    {/* Sidebar */}
  </div>
  <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-120px)]">
    {/* Main content */}
  </div>
</div>
```

#### Common Spacing

- Page padding: `p-4 sm:p-6` with `pt-16 sm:pt-20` (for fixed TopNavBar)
- Card padding: `p-6` or `p-4 sm:p-5` (container), `p-4` (item)
- Section gaps: `mb-6` or `mb-8`
- Element gaps: `gap-2` to `gap-4`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Two-column layout: `grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6`

### Responsive Patterns

Most pages use `sm:` breakpoint for mobile/desktop transitions:
```tsx
// Responsive text
"text-2xl sm:text-3xl font-bold"
"text-xs sm:text-sm font-medium"

// Responsive padding
"p-4 sm:p-6"

// Hide on mobile, show on desktop
"hidden sm:inline"  // text
"hidden md:block"   // side panels

// Responsive grid
"grid-cols-1 lg:grid-cols-[340px_1fr]"
```

## Component Architecture

### Directory Structure

```
src/components/
├── App.tsx                          # Routes + ProtectedRoute
├── TopNavBar.tsx                    # Floating glassmorphic navigation
├── Dashboard.tsx                    # Home page (document grid + widgets)
├── DashboardDocumentCard.tsx        # Document card for dashboard grid
├── RecentlyOpened.tsx               # Recently opened documents strip
├── ProgressChart.tsx                # Hardcoded progress chart
├── DailyTasks.tsx                   # Tasks component
├── StoriesPage.tsx                  # Core Stories grid matrix + STAR editor
├── ProfilePage.tsx                  # User profile + resume viewer
├── ResumeReviewPage.tsx             # 4-tab resume analysis interface
├── ErrorBoundary.tsx                # App-level error boundary
├── LoadingSpinner.tsx               # Reusable (in ui/)
├── ThemeToggle.tsx                  # DEAD CODE - do not use
├── Sidebar.tsx                      # DEAD CODE - not used in routes
│
├── documents/                       # Document editor
│   ├── DocumentPage.tsx             # Q&A document editor (reference style)
│   ├── DocumentCard.tsx             # Document preview card
│   ├── DocumentGrid.tsx             # Document listing with grid/list
│   └── QuestionItem.tsx             # Draggable Q&A item
│
├── onboarding/                      # Onboarding flow
│   ├── OnboardingFlow.tsx           # 5-step wizard orchestrator
│   ├── WelcomeStep.tsx              # Name, target role, company
│   ├── SurveyStep.tsx               # 3-screen Likert assessment
│   ├── ResumeUploadStep.tsx         # PDF parsing + manual entry
│   ├── CoreStoryMatchStep.tsx       # AI story match suggestions
│   ├── CompletionStep.tsx           # Welcome screen
│   └── StoryCreationStep.tsx        # DEAD CODE - not imported
│
├── profile/                         # Resume Architect components
│   ├── ResumeChat.tsx               # AI chat with streaming (923 lines)
│   ├── CoachingWorkspaceSidebar.tsx # Goals, todos, versions sidebar
│   ├── BulletAnalysisCard.tsx       # Bullet issue display
│   ├── TriggerPointsCard.tsx        # Trigger point comfort rating
│   ├── CandidateProfileSummary.tsx  # Profile + story readiness
│   ├── ChangeProposalCard.tsx       # Accept/reject change proposals
│   ├── AIConsentBanner.tsx          # AI usage consent
│   └── TodoTaskCard.tsx             # Todo item in sidebar
│
└── ui/                              # Reusable UI primitives (shadcn/ui)
    ├── button.tsx                   # CVA variants: default, destructive, outline, secondary, ghost, link
    ├── card.tsx                     # Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction
    ├── badge.tsx                    # Badge variants
    ├── dropdown-menu.tsx            # Radix dropdown
    ├── input.tsx                    # Styled input
    ├── LoadingSpinner.tsx           # Loader2 spinner with message/size/fullScreen props
    └── utils.ts                     # cn() utility (clsx + tailwind-merge)
```

### Page Components
- Mapped to routes in `App.tsx`
- Fetch data from services via hooks
- Manage page-level state with `useState` + `useEffect`
- Handle loading (via `LoadingSpinner`) and error states
- Use static class strings (no theme conditionals)

### Route Structure

```typescript
<Routes>
  <Route path="/onboarding" element={<OnboardingFlow />} />
  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/stories" element={<ProtectedRoute><StoriesPage /></ProtectedRoute>} />
  <Route path="/document" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />
  <Route path="/document/:id" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />
  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
  <Route path="/resume-review" element={<ProtectedRoute><ResumeReviewPage /></ProtectedRoute>} />
</Routes>
```

`ProtectedRoute` checks onboarding completion. Redirects to `/onboarding` if incomplete.

## Key UI Patterns

### Card Pattern

```tsx
// Container card (most common across the app)
<div className="rounded-2xl bg-surface shadow-lg border border-gray-100 p-4 sm:p-5">

// Onboarding card
<div className="rounded-2xl p-8 bg-surface shadow-xl">

// Chat container
<div className="flex flex-col h-full rounded-2xl bg-surface shadow-lg border border-gray-200 overflow-hidden">
```

### Action Buttons

```tsx
// Primary action (blue, filled)
<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">

// Gradient CTA (analyze, prominent actions)
<button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all">

// Secondary action (surface border)
<button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">

// Ghost / navigation button
<button className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600">

// Tab pill (active)
<button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">

// Tab pill (inactive)
<button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100">
```

### Loading Spinner

```tsx
import { LoadingSpinner } from './ui/LoadingSpinner';

// Full-screen (default)
<LoadingSpinner />

// Inline
<LoadingSpinner fullScreen={false} message="Loading document..." />

// Small variant
<LoadingSpinner size="sm" message="" />
```

Uses Lucide `Loader2` with `animate-spin`, not a custom CSS spinner.

### Empty State

```tsx
<div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-surface">
  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
  <h3 className="text-lg font-semibold mb-2 text-gray-700">No documents yet</h3>
  <p className="text-sm mb-4 text-gray-500">Create your first Q&A document to get started</p>
  <Link className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
    <Plus className="w-4 h-4" />
    Create Document
  </Link>
</div>
```

### Score Badge (Resume Architect)

```tsx
function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const color =
    score >= 80 ? 'text-green-600 bg-green-50 border-green-200' :
    score >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-red-600 bg-red-50 border-red-200';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${color}`}>
      {label && <span className="font-normal text-gray-500">{label}:</span>}
      {score}/100
    </span>
  );
}
```

### Value Proposition Card (Onboarding Survey)

```tsx
<div className="flex gap-4 p-5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
    {icon}
  </div>
  <div className="flex-1">
    <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
    <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
  </div>
</div>
```

### Icon Container

Used throughout for colored icon backgrounds:
```tsx
// Small (in cards, widgets)
<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
  <Icon className="w-4 h-4 text-white" />
</div>

// Large (in AI consent banner, profile)
<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
  <Icon className="w-5 h-5 text-white" />
</div>

// Avatar
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
  {initials}
</div>
```

### Inline Editable Title

```tsx
<input
  type="text"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  className="w-full text-3xl font-bold mb-3 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-gray-900"
  placeholder="Document Title"
/>
```

### Tab Navigation (Resume Architect)

Numbered tab pills with arrows between them:
```tsx
<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6">
  {tabs.map((tab, i) => (
    <div key={tab.key} className="flex items-center">
      <button className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full">
        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold">
          {tab.num}
        </span>
        <span>{tab.label}</span>
      </button>
      {i < tabs.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300" />}
    </div>
  ))}
</div>
```

### STAR Editor (Core Stories)

Color-coded fields: S=blue, T=purple, A=green, R=orange:
```tsx
{Object.entries({
  situation: { label: 'Situation', color: 'blue' },
  task: { label: 'Task', color: 'purple' },
  action: { label: 'Action', color: 'green' },
  result: { label: 'Result', color: 'orange' },
}).map(([key, meta]) => (
  <div key={key}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`w-6 h-6 rounded-full bg-${meta.color}-600 flex items-center justify-center text-white font-bold text-xs`}>
        {meta.label[0]}
      </div>
      <label className="text-sm font-semibold text-gray-800">{meta.label}</label>
    </div>
    <textarea className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-${meta.color}-500`} />
  </div>
))}
```

## Icons

Using **Lucide React** for all icons (except dead code in Sidebar.tsx which uses inline SVGs).

### Sizing Convention

| Context | Classes |
|---------|---------|
| Small (in buttons, meta, badges) | `w-4 h-4` |
| Default (nav, headers, cards) | `w-5 h-5` |
| Section icons | `w-6 h-6` or `w-8 h-8` |
| Empty state illustration | `w-12 h-12` or `w-16 h-16` |

### Common Icon Imports

```typescript
import {
  Plus, Search, Save, ArrowLeft, ArrowRight, ArrowUpDown,
  FileText, Grid3X3, List, Zap, Target, Shield, TrendingUp,
  Loader2, AlertTriangle, CheckCircle, XCircle, AlertCircle,
  ChevronDown, ChevronRight, ChevronsUp, ChevronsDown,
  RefreshCw, Sparkles, Layout, ListTodo, Trophy, Calendar, Trash2,
  GripVertical, Menu, X,
} from 'lucide-react';
```

## Global Styles (`src/index.css`)

```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
  -webkit-font-smoothing: antialiased;
  background-color: #f3f4f6; /* gray-100 */
}

html { scroll-behavior: smooth; }

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #f3f4f6; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

## Dead Code

These components exist in the codebase but are not used in routing or imports:
- `src/components/ThemeToggle.tsx` - Dark mode toggle, deprecated
- `src/components/Sidebar.tsx` - Left sidebar navigation, replaced by TopNavBar
- `src/components/onboarding/StoryCreationStep.tsx` - Old story creation step, replaced by CoreStoryMatchStep

## Testing

### Setup
- **Framework**: Vitest (configured in `vite.config.ts`)
- **DOM Environment**: jsdom
- **Component Testing**: React Testing Library + @testing-library/user-event
- **Coverage**: @vitest/coverage-v8

### Test Utilities
- `src/test/setup.ts` - Global setup
- `src/test/test-utils.tsx` - `renderWithProviders()` wrapper
- `src/test/mock-services.ts` - `createMockServices()` and service mocks

### Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```
