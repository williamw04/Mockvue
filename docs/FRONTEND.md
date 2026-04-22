# Frontend Patterns & Conventions

**Version**: 4.0.0
**Last Updated**: 2026-04-21

This document covers frontend-specific patterns, UI conventions, and component guidelines for Mockvue's **Editorial Design System**. 

> [!WARNING]
> This is a complete redesign from the original SaaS-style UI. Floating glassmorphic navs, heavy drop shadows, rounded corners (`rounded-2xl`), and generic blue gradients are DEPRECATED.
> The new design is **editorial, flat, and warm**—think of a well-designed textbook or field guide.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript (strict mode) |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React (rarely used now, favor typography) |
| Routing | React Router v6 (HashRouter) |
| Class Utilities | clsx, tailwind-merge (via cn()) |

## Editorial Design System

### Color Palette

The color palette is warm and high-contrast, avoiding pure white for backgrounds and pure black for text.

| Role | Tailwind Class | Hex/Value |
|------|----------------|-----------|
| Background | `bg-bg` | `#faf7f2` |
| Primary Text | `text-ink` | `#1a1814` |
| Secondary Text | `text-ink-2` | `#4a4640` |
| Tertiary/Muted | `text-ink-3` | `#8a857d` |
| Borders/Rules | `border-rule` | `rgba(26,24,20,0.09)` |
| Card Background | `bg-card` | `#ffffff` |

#### Accents

We use specific accent palettes to convey state or focus. The default accent is **Ember**.

| Role | Tailwind Class | Hex/Value | Description |
|------|----------------|-----------|-------------|
| Accent Primary | `bg-accent-hi`, `text-accent-hi` | `#d9532b` | Primary buttons, active states, progress fills |
| Accent Secondary | `bg-accent-lo` | `#f4e4d8` | Soft highlight backgrounds, tag backgrounds |

*(Other variations like Moss, Cobalt, Graphite, and Clay are supported in tokens but Ember is the default UI accent).*

### Typography

Typography is the core of the editorial design. We use three distinct font families to establish hierarchy.

#### Font Stack
Configured in `tailwind.config.js`:
- `font-serif`: `Spectral, "Iowan Old Style", Georgia, serif`
- `font-sans`: `"Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- `font-mono`: `"JetBrains Mono", "SF Mono", ui-monospace, monospace`

#### Usage Rules

| Element | Font Family | Example Classes | Usage |
|---------|-------------|-----------------|-------|
| Hero Headings | **Serif** | `font-serif text-5xl tracking-tight` | Page titles, large greetings, major section headers |
| Body Text | **Sans** | `font-sans text-sm text-ink-2` | Paragraphs, standard UI elements, captions |
| Metadata | **Mono** | `font-mono text-[10px] tracking-wider uppercase` | Dates, stages, status labels, IDs, small metrics |
| Metrics (Large) | **Serif** | `font-serif text-4xl text-accent-hi` | Big numbers (e.g., ATS scores) |

### Borders & Corners

- **No large border radii**: Avoid `rounded-xl`, `rounded-2xl`, `rounded-full` (except for actual circles/avatars).
- Use sharp corners or very slight rounding: `rounded-sm` (2px) or `rounded` (4px).
- **Heavy use of rules**: Separate content using `border border-rule` or `border-b border-rule`.

### Shadows
- **Shadows are deprecated** for general UI structure. Cards should rely on borders (`border border-rule`) and backgrounds (`bg-card`) to separate from the canvas (`bg-bg`).
- Use deep, diffuse shadows *only* for fullscreen modals or focus overlays (e.g., `shadow-[0_20px_80px_rgba(0,0,0,0.4)]`).

## Component Patterns

### Top Navigation
The top navigation is a flush bar, not a floating pill.
```tsx
<div className="flex items-center gap-6 px-14 py-4 border-b border-rule bg-card">
  <div className="font-serif text-xl font-medium">Mockvue</div>
  <nav className="flex gap-7 text-sm text-ink-2">
    <span className="text-ink font-medium border-b-2 border-accent-hi pb-0.5">Dashboard</span>
    <span>Resume</span>
  </nav>
</div>
```

### Cards & Panels
```tsx
<div className="bg-card border border-rule p-7">
  <div className="font-mono text-[10px] text-accent-hi tracking-widest mb-1.5 uppercase">
    Active Stage
  </div>
  <h2 className="font-serif text-3xl mb-1">Core Stories</h2>
  <div className="text-sm text-ink-2 mt-1.5">Build your library of 10</div>
</div>
```

### Action Buttons
Buttons are solid and flat, without rounded corners.
```tsx
// Primary Action
<button className="bg-accent-hi text-white border-none px-4 py-2 text-[13px] font-semibold cursor-pointer">
  Continue building stories →
</button>

// Secondary Action
<button className="bg-transparent text-ink border border-rule px-4 py-2 text-[13px] cursor-pointer">
  View all categories
</button>
```

### Layouts & Spacing
- Use CSS Grid heavily for structural alignment.
- Padding is generous to let typography breathe (e.g., `p-10`, `px-14 py-8`).
- Section headers often mix monospace metadata with serif titles.

```tsx
<div className="px-14 py-6 relative">
  <div className="flex items-baseline justify-between mb-6">
    <div className="text-[13px] font-semibold text-ink-2 tracking-wide uppercase">
      The Core Loop
    </div>
    <div className="font-mono text-[11px] text-ink-3">
      2 of 6 complete · 38% overall
    </div>
  </div>
  {/* Content */}
</div>
```

### Indicators
- Use small colored dots (`MVDot`) for status instead of large pill badges.
- Use stroke-based rings (`MVRing`) for progress, not thick progress bars.

```tsx
// Status Dot
<span className="inline-block w-2 h-2 rounded-full bg-accent-hi shrink-0" />
```

## Migration Status

We are currently migrating the app to this new design system. If you touch an old component using `shadow-lg`, `rounded-2xl`, or blue gradients, you must refactor it to match the Editorial style documented here.
