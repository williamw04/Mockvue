# Mockvue

Desktop app for behavioral interview preparation. Helps job seekers optimize their resume and build a library of structured STAR stories through AI coaching.

## What It Does

Mockvue guides users through a core loop:

```
Upload Resume → Improve Resume → Build Stories → Practice Delivery → Interview with Confidence
```

Users build 10 core STAR-method stories that cover ~90% of behavioral questions, with an AI agent that coaches (not replaces) their decision-making.

## Tech Stack

- **Electron** + **React 18** + **TypeScript** (desktop app, local data)
- **Vite** build system
- **Tailwind CSS** + **Radix UI** (via shadcn/ui) for styling
- **Gemini AI** agent with tool-calling for AI features
- **Service Abstraction Layer** for platform-agnostic code

## Quick Start

```bash
npm install
npm run electron:dev
```

The app runs on Electron. See [CONTRIBUTING.md](./CONTRIBUTING.md) for full setup instructions.

## Documentation

| Document                                               | Purpose                                      |
| ------------------------------------------------------ | -------------------------------------------- |
| [CONTRIBUTING.md](./CONTRIBUTING.md)                   | How to develop, test, and contribute         |
| [AGENTS.md](./AGENTS.md)                               | AI agent operating guide for code generation |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                   | System architecture and service layer        |
| [docs/PRODUCT_VISION.md](./docs/PRODUCT_VISION.md)     | Product definition and core loop             |
| [docs/FEATURE_PURPOSES.md](./docs/FEATURE_PURPOSES.md) | Why each feature exists                      |
| [docs/FRONTEND.md](./docs/FRONTEND.md)                 | Design system and UI conventions             |
| [docs/features/](./docs/features/)                     | Per-feature specs and progress               |

## License

MIT
