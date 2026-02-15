# Frontend Patterns & Conventions

**Version**: 1.1.0  
**Last Updated**: 2026-02-14

This document covers frontend-specific patterns, UI conventions, and component guidelines for Mockvue. **The document editor components define the canonical style, theme, and text patterns for the entire project** — all new UI should match their look and feel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript (strict mode) |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Component Library | Radix UI (headless) |
| Icons | Lucide React |
| Routing | React Router v7 |
| Drag & Drop | react-dnd |
| Class Utilities | clsx, tailwind-merge, class-variance-authority |

## Design System (Derived from Document Editor)

The document editor (`src/components/documents/`) is the **reference implementation** for Mockvue's visual identity. All components should follow these patterns.

### Theme System

Theme is managed via React Context (`src/services/ThemeContext.tsx`), NOT Tailwind's `dark:` class strategy (though some components use both — see note below).

```typescript
import { useTheme } from '../services/ThemeContext';

const { theme } = useTheme();  // Returns 'light' | 'dark'
```

The `ThemeProvider` persists the user's preference in `localStorage` and respects `prefers-color-scheme`. It adds `'light'` or `'dark'` as a class on `<html>`.

**Important**: The codebase uses **two theming approaches** side by side:
1. **Conditional classes via `theme` variable** (primary pattern, used in DocumentPage, Dashboard, Sidebar, DocumentCard, DocumentGrid)
2. **Tailwind `dark:` prefix** (used in QuestionItem, some UI primitives)

When writing new components, **use the `theme` variable approach** for consistency with page-level components. Use `dark:` only in low-level UI primitives that don't have access to the theme context.

### Color Palette

#### Backgrounds
| Role | Light | Dark |
|------|-------|------|
| Page background | `bg-gray-50` | `bg-gray-900` |
| Card / Panel | `bg-white` | `bg-gray-800` |
| Card nested / hover | `bg-gray-50` / `hover:bg-gray-100` | `bg-gray-700` / `hover:bg-gray-600` |
| Input background | `bg-white` | `bg-gray-900` |
| Elevated dropdown | `bg-white` | `bg-gray-800` |

#### Text
| Role | Light | Dark |
|------|-------|------|
| Heading / Primary | `text-gray-900` | `text-gray-100` or `text-white` |
| Body / Secondary | `text-gray-600` | `text-gray-400` |
| Muted / Tertiary | `text-gray-500` | `text-gray-500` |
| Placeholder | `text-gray-400` (via placeholder attr) | `text-gray-500` |

#### Borders
| Role | Light | Dark |
|------|-------|------|
| Card border | `border-gray-200` | `border-gray-700` |
| Divider / separator | `border-gray-100` or `border-gray-200` | `border-gray-700` |
| Input border | `border-gray-200` | `border-gray-600` |
| Active / focus | `border-blue-400` or `ring-blue-500` | `border-blue-500` or `ring-blue-500` |

#### Accent Colors
| Role | Value |
|------|-------|
| Primary action | `bg-blue-600 hover:bg-blue-700 text-white` |
| Primary icon | `text-blue-600` (light) / `text-blue-400` (dark) |
| Active nav | `bg-blue-50 text-blue-600` (light) / `bg-blue-900/20 text-blue-400` (dark) |
| Tag / Badge | `bg-blue-100 text-blue-700` (light) / `bg-blue-900/30 text-blue-400` (dark) |
| Destructive | `text-red-600` (light) / `text-red-400` (dark) |
| Banner gradient | `bg-gradient-to-r from-blue-500 to-purple-600 text-white` |
| Avatar gradient | `bg-gradient-to-br from-blue-500 to-purple-600 text-white` |

#### Custom Tailwind Colors
Defined in `tailwind.config.js`:
```javascript
primary: {
  50: '#f0f9ff',
  100: '#e0f2fe',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
}
```

### Typography

#### Font Stack
System font stack (defined in `src/index.css`):
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

#### Scale (from Document Editor)
| Element | Classes |
|---------|---------|
| Document title | `text-3xl font-bold` |
| Section heading | `text-xl font-bold` |
| Card title | `font-semibold` (default size) |
| Body text | default (`text-sm` or base) |
| Meta / timestamps | `text-xs` |
| Button text | `text-sm font-medium` |

### Spacing & Layout

#### Page Layout
```tsx
// Full-screen page with centered content (DocumentPage pattern)
<div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
  <div className="max-w-3xl mx-auto">
    {/* Content */}
  </div>
</div>

// Dashboard layout with sidebar
<div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
  <Sidebar />
  <main className="flex-1 overflow-y-auto">
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Content */}
    </div>
  </main>
</div>
```

#### Card Pattern (from DocumentGrid / DocumentCard)
```tsx
// Container card
<div className={`rounded-2xl p-6 shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>

// Item card within a grid
<div className={`rounded-lg border transition-all hover:shadow-md ${
  theme === 'dark'
    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
    : 'bg-white border-gray-200 hover:border-gray-300'
}`}>
```

#### Common Spacing
- Page padding: `py-8 px-4` or `px-6 py-8`
- Card padding: `p-6` (container) or `p-4` (item)
- Section gaps: `mb-6`
- Element gaps: `gap-2` to `gap-4`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

### Border Radius
| Element | Class |
|---------|-------|
| Page-level cards | `rounded-2xl` |
| Item cards | `rounded-lg` |
| Buttons | `rounded-lg` |
| Inputs | `rounded-md` |
| Tags / Badges | `rounded-full` |
| Avatar | `rounded-full` |

### Shadows
- Container cards: `shadow-lg`
- Item cards on hover: `hover:shadow-md`
- Banner: `shadow-xl`
- Dropdown: `shadow-xl`

### Transitions
All interactive elements use `transition-colors` or `transition-all`:
```tsx
className="transition-colors"      // for color-only changes
className="transition-all"         // for hover effects with shadow/border
className="transition-all duration-200"  // for navigation state changes
className="transition-colors duration-200"  // for theme transitions
```

## Component Architecture

### Three-Tier Component Structure

```
src/components/
├── [PageComponent].tsx       # Route-level pages (Dashboard, StoriesPage, etc.)
├── [feature]/                # Feature-specific components
│   ├── documents/            # Document editor components ← REFERENCE STYLE
│   │   ├── DocumentPage.tsx  # Q&A document editor
│   │   ├── DocumentCard.tsx  # Document preview card
│   │   ├── DocumentGrid.tsx  # Document listing with grid
│   │   └── QuestionItem.tsx  # Draggable Q&A item
│   └── onboarding/           # Onboarding flow components
└── ui/                       # Reusable UI primitives (shadcn/ui)
    ├── button.tsx            # CVA variants: default, destructive, outline, secondary, ghost, link
    ├── card.tsx              # Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
    ├── badge.tsx
    ├── dropdown-menu.tsx
    └── utils.ts              # cn() utility
```

### Page Components
- Mapped to routes in `App.tsx`
- Fetch data from services via hooks
- Manage page-level state with `useState` + `useEffect`
- Handle loading and error states
- Get theme via `useTheme()` and apply conditional classes
- Compose feature and UI components

### Feature Components
- Domain-specific logic and layout
- May use service hooks directly
- Use `useCallback` for handlers passed to children (see DocumentPage)
- Live in named subdirectories under `components/`

### UI Primitives (shadcn/ui Pattern)
- Headless, composable, reusable
- Built on Radix UI for accessibility
- Styled with Tailwind CSS via `cn()` utility from `src/components/ui/utils.ts`
- Use `class-variance-authority` (CVA) for variants
- Accept `className` prop for customization
- Use `dark:` prefix (since they don't depend on ThemeContext)

## Key UI Patterns (from Document Editor)

### Inline Editable Title
Document titles and descriptions are plain `<input>` elements styled to look like text:
```tsx
<input
  type="text"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  className={`w-full text-3xl font-bold mb-3 bg-transparent border-none focus:outline-none focus:ring-0 p-0 ${
    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  }`}
  placeholder="Document Title"
/>
```

### Expandable List Items (Accordion Pattern)
Questions use a collapsible pattern with chevron toggle:
```tsx
<div onClick={() => setIsExpanded(!isExpanded)}>
  {isExpanded ? <ChevronDown /> : <ChevronRight />}
  <input value={question.text} />  {/* Editable inline */}
</div>
{isExpanded && (
  <textarea value={question.response} placeholder="Type your response here..." />
)}
```

### Drag-and-Drop Reordering
Uses `react-dnd` with `HTML5Backend`:
```tsx
<DndProvider backend={HTML5Backend}>
  {items.map((item, index) => (
    <DraggableItem key={item.id} index={index} moveItem={moveItem} />
  ))}
</DndProvider>
```

Drag handles use `GripVertical` icon with `cursor-grab active:cursor-grabbing`.

### Action Buttons
```tsx
// Primary action (blue, filled)
<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
  <Save className="w-4 h-4" />
  {saving ? 'Saving...' : 'Save Document'}
</button>

// Secondary action (themed border)
<button className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
  theme === 'dark'
    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300'
    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
}`}>
  <Plus className="w-4 h-4" />
  Add Question
</button>

// Ghost / navigation button
<button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
  theme === 'dark'
    ? 'hover:bg-gray-800 text-gray-300'
    : 'hover:bg-gray-100 text-gray-600'
}`}>
  <ArrowLeft className="w-5 h-5" />
  Back to Dashboard
</button>
```

### Loading Spinner
Consistent across all pages:
```tsx
<div className={`flex h-screen items-center justify-center ${
  theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
}`}>
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading...</p>
  </div>
</div>
```

### Empty State
```tsx
<div className={`text-center py-12 border-2 border-dashed rounded-lg ${
  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
}`}>
  <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
    No documents yet
  </h3>
  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
    Create your first Q&A document to get started
  </p>
  <Link className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
    <Plus className="w-4 h-4" />
    Create Document
  </Link>
</div>
```

### Relative Time Formatting
```typescript
const formatDate = (dateString: string) => {
  const diffMins = ...;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};
```

## Routing

### Route Structure
```typescript
<Routes>
  <Route path="/onboarding" element={<OnboardingFlow />} />
  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
  <Route path="/stories" element={<ProtectedRoute><StoriesPage /></ProtectedRoute>} />
  <Route path="/document" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />
  <Route path="/document/:id" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />
</Routes>
```

### Protected Routes
`ProtectedRoute` checks onboarding completion. Redirects to `/onboarding` if incomplete.

### Platform-Adaptive Router
- Web: `BrowserRouter` — clean URLs
- Electron: `HashRouter` — `file://` protocol compatible

## Icons

Using **Lucide React** for all icons:
```typescript
import { FileText, Plus, Search, Save, ArrowLeft, GripVertical, ChevronDown, ChevronRight, ChevronsUp, ChevronsDown, Calendar, Trash2 } from 'lucide-react';
```

### Sizing Convention
| Context | Classes |
|---------|---------|
| Small (in buttons, meta) | `w-4 h-4` |
| Default (nav, headers) | `w-5 h-5` |
| Large (section icons) | `w-6 h-6` |
| Empty state illustration | `w-16 h-16` |

**Note**: The Sidebar still uses inline SVGs instead of Lucide — this should be migrated for consistency (tracked in tech debt).

## Global Styles (`src/index.css`)

```css
body {
  background-color: #f9fafb;  /* gray-50 — overridden by theme classes */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
  -webkit-font-smoothing: antialiased;
}

/* Custom scrollbar (dark theme) */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #111827; }  /* gray-900 */
::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }  /* gray-700 */
```

**Note**: The scrollbar styles are always dark regardless of theme. This should ideally be theme-aware.

## Performance

### Current SLOs
- **App startup**: < 2 seconds
- **Document creation**: < 100ms
- **Search**: < 200ms (100 documents)
- **Auto-save debounce**: 2 seconds

### Guidelines
- Use `useCallback` for handlers passed to children (DocumentPage does this for `moveQuestion`, `updateResponse`, `updateQuestionText`)
- Keep state local to components
- Lazy load routes if bundle size becomes an issue

## Testing

### Target Setup (Not yet configured)
- **Framework**: Vitest (recommended for Vite projects)
- **Component Testing**: React Testing Library
- **Coverage Target**: 70% for components

## References

- `ARCHITECTURE.md` — System architecture
- `docs/DESIGN.md` — Architectural patterns
- `docs/design-docs/core-beliefs.md` — Foundational principles
- `docs/guide/SERVICES_USAGE.md` — Service usage guide
