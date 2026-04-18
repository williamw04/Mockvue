# Dashboard - Product Specification

## Purpose
The Dashboard serves as the central hub and "guided roadmap" for the user's interview preparation journey. It is no longer just a document manager. Instead, it provides clear next steps, tracks progress across various preparation stages (Resume, Core Stories, Documents, Practice), and offers immediate entry points into active coaching sessions.

## Current State vs. Vision
- **Current State:** Likely a list of documents or disjointed links to other features.
- **Vision:** A clean, modern, progressive-disclosure interface that feels like a personalized coaching roadmap. It highlights the next most important action the user should take.

## Core Features
1. **Welcome & Progress Summary:** A personalized greeting with a high-level progress indicator (e.g., "Resume 80% optimized", "3 Core Stories drafted").
2. **Next Best Action (Hero Card):** The primary CTA guiding the user to their most critical pending task (e.g., "Finish your Resume Architect session" or "Draft your first Core Story"). This should utilize the gradient accent (`bg-gradient-to-br from-blue-500 to-purple-600`).
3. **Preparation Roadmap:** A visual step-by-step track showing:
   - User Onboarding (Completed)
   - Resume Architect (In Progress)
   - Core Stories (Pending)
   - Company Research & Documents (Pending)
   - Practice Tools & Voice Interview (Locked/Pending)
4. **Recent Activity / Quick Access:** A section to quickly jump back into recent documents or coaching sessions.

## UI/UX & Styling Guidelines
Strict adherence to `docs/FRONTEND.md`:
- **Theme:** Light-mode only.
- **Background:** Page background `bg-gray-100`.
- **Cards:** Main content areas use `bg-surface` (`#fafbfc` or Tailwind equivalent `bg-slate-50`/`white`), heavily rounded (`rounded-2xl`), softly shadowed (`shadow-lg`), and bordered (`border border-gray-100` or `border-gray-200`).
- **Primary Actions:** `bg-blue-600 hover:bg-blue-700 text-white rounded-lg`.
- **Accents:** Gradients for the "Next Best Action" card or progress indicators (`from-blue-500 to-purple-600`).
- **Typography:** System font stack, `text-3xl font-bold` for the main "Welcome" title, `text-sm` for secondary body text.
- **Icons:** Lucide React icons, default `w-5 h-5`.

## Service Dependencies
- `IUserService`: To fetch user profile details (name, onboarding status, overall progress).
- `ICoachingService`: To check for active goals, pending todos, or staged changes to determine the "Next Best Action".

## Future Enhancements
- Integration with calendar for upcoming interviews to dynamically adjust the roadmap urgency.
- Gamification elements (streaks, badges) tied to the roadmap.
