# User Onboarding — Product Specification

**Status**: Built (iterate as product direction solidifies)  
**Last Updated**: 2026-04-17  
**Canonical narrative**: [Feature Purposes § Onboarding](../../FEATURE_PURPOSES.md#1-onboarding)

## Summary

Take users from zero to a usable profile: identity, pain survey, resume data, and initial AI-suggested mappings into the 10 core story categories so the rest of the product can personalize.

## Product intent (stable)

| Question | Answer |
|----------|--------|
| **Why it exists** | Without profile + resume + story seeds, coaching and roadmap features have nothing to personalize. |
| **Success for the user** | They finish feeling the app “knows” them enough to give relevant next steps, not generic advice. |
| **Success for the product** | Persisted `UserProfile`, `Resume`, and `CoreStoryMatch[]` (or equivalent) ready for Dashboard, Resume Architect, and Core Stories. |

## Flow (as implemented)

1. Welcome  
2. Survey (Likert pain assessment)  
3. Resume upload / entry (incl. PDF parse via Gemini where applicable)  
4. Core story match (AI maps experiences to categories)  
5. Completion  

## Open questions (needs explicit product decisions)

Use this list when you redefine the feature; strike through items once decided.

- [ ] **Survey → dashboard weighting**: Confirm the exact rules for which roadmap stage the survey emphasizes first (and whether that stays post-dashboard rewrite).
- [ ] **Resume minimum**: What counts as “good enough” to leave onboarding vs. nudging users to Resume Architect?
- [ ] **Story match quality**: How do we message low-confidence mappings, and can users bulk-reject or re-run matching?
- [ ] **Skip paths**: Which steps are optional for returning users or power users (if any)?

## Acceptance criteria (draft)

Criteria should be tightened once the open questions are resolved.

- [ ] New user can complete onboarding without dead ends; state is persisted across refresh.
- [ ] Survey responses are stored and consumed by at least one downstream surface (e.g. dashboard emphasis) per product decision.
- [ ] Resume data is available to Resume Architect and related services per `IUserService` / document contracts.
- [ ] Core story suggestions are visible in Core Stories with clear provenance (“suggested from onboarding”).

## Related code / services (orientation)

- User profile, resume, stories: `IUserService` and onboarding flows under `src/` (search for onboarding routes and steps).
- Align implementation details with [ARCHITECTURE.md](../../../ARCHITECTURE.md) service boundaries.

## See also

- [Feature index](../index.md)
