# Core Stories — Product Specification

**Status**: Built; integration and scoring direction under discussion  
**Last Updated**: 2026-04-17  
**Canonical narrative**: [Feature Purposes § Core Stories](../../FEATURE_PURPOSES.md#4-core-stories)

## Summary

Ten behavioral categories, each with a STAR-structured story, so users can adapt answers across most behavioral interviews.

## Product intent (stable)

| Question | Answer |
|----------|--------|
| **Why it exists** | Behavioral interviews reward prepared narratives; scattered notes don’t scale. |
| **Success for the user** | For each category, they have a story they trust and can adapt under pressure. |
| **Success for the product** | Story data is structured, tagged, and reusable by Prep Sheets and (later) practice surfaces. |

## The ten categories

As listed in [Feature Purposes](../../FEATURE_PURPOSES.md#4-core-stories): Conflict, Failure, Leadership, Adaptability, Tight Deadline, Difficult Customer, Data-Driven Decision, Above and Beyond, Persuasion, Proudest Accomplishment.

## Open questions (needs explicit product decisions)

- [ ] **Completeness**: How do we score “good enough” per category (length, metrics, STAR balance)?
- [ ] **Practice linkage**: When practice tools exist, what’s the minimum viable link (tags only, drills, full mock)?
- [ ] **AI role**: Suggestion vs. co-editing vs. review-only for story quality.
- [ ] **Onboarding handoff**: How edits to suggested mappings propagate (single source of truth)?

## Acceptance criteria (draft)

- [ ] User can see all 10 categories with clear status (empty / draft / complete per your definition).
- [ ] User can edit STAR fields per story with persistence.
- [ ] Cross-references (tags) work as agreed in design.
- [ ] Exported or referenced story IDs can be consumed by Prep Sheets per Prep Sheets spec.

## See also

- [Prep Sheets](../prep-sheets/product-spec.md) — Story Bank integration
- [Feature index](../index.md)
