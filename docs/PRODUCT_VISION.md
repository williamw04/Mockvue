# Mockvue Product Vision

**Version**: 2.0
**Last Updated**: 2026-04-14

## What Is Mockvue

Mockvue is a desktop app that helps job seekers prepare for behavioral interviews. It does this through two equal pillars:

1. **Resume optimization** - Analyze, rewrite, and tailor your resume so it passes ATS filters and impresses recruiters.
2. **Behavioral interview prep** - Build a library of structured STAR stories, then practice delivering them until they feel natural.

The insight behind Mockvue is that great interview answers come from real experiences, not memorized scripts. The app helps you extract your experiences, structure them, and practice them.

## Who It's For

Job seekers who:
- Have real work experience but struggle to articulate it under pressure
- Get caught off guard by behavioral questions they didn't prepare for
- Doubt whether their resume bullets are strong enough
- Want structured practice, not just reading tips online

## The Core Loop

```
Upload Resume → Improve Resume → Build Stories → Practice Delivery → Interview with Confidence
```

Users move through these stages at their own pace. The dashboard should guide them through this sequence, showing what's done and what's next.

## What Makes This Different

- **Stories are the foundation**, not answers. You don't prep for specific questions. You build 10 core stories that cover ~90% of behavioral questions, then adapt them.
- **AI coaching, not AI answers.** The agent asks questions, proposes rewrites, suggests improvements - but the user makes the decisions. Accept, reject, or modify.
- **Everything is connected.** Your resume feeds story suggestions. Your stories feed practice tools. Your practice results feed back into what needs work.

## The 6 Features

| Feature | Purpose | Status |
|---------|---------|--------|
| Onboarding | Get user from zero to having a profile, resume, and initial story matches | Built |
| Dashboard | Guided roadmap that moves users through the core loop | Needs rewrite |
| Resume Architect | Analyze and improve resume through AI coaching with change proposals | Built, actively improving |
| Core Stories | Build a library of 10 STAR-method stories mapped to core interview categories | Built, needs redesign |
| Prep Sheets | Create company-specific interview cheat sheets with scraped data autofill | Planned (replacing Documents) |
| Practice Tools | Flashcards, interview simulator, AI mock interviews | Planned |

## What Mockvue Is Not

- A job board or application tracker
- A generic AI chatbot - every AI interaction is contextualized with the user's resume and stories
- A web app - it's Electron-only for local file access and privacy

## Technical Foundation

- **Electron + React + TypeScript** - Desktop app, local data
- **Gemini AI** - Tool-calling agent with 16 tools for resume data, coaching, and memory
- **Service abstraction** - Components use hooks, never call platform APIs directly
- **Single agent runtime** - One Gemini model with configurable prompts per assistant type, not a multi-agent pipeline

## Design Principles

1. **Guide, don't overwhelm.** The user should always know what to do next.
2. **User owns their data.** Everything stored locally in files, not in a cloud service.
3. **AI assists, user decides.** The agent proposes, the user accepts/rejects/modifies.
4. **Connected experience.** Features share data. Resume analysis feeds story suggestions. Stories feed practice.
5. **Progressive disclosure.** Don't show everything at once. Reveal complexity as the user needs it.
