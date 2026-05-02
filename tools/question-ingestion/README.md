# Question Ingestion Tool

Standalone TypeScript ingestion scaffold for company interview questions.

## Commands

```bash
npm --prefix tools/question-ingestion install
npm --prefix tools/question-ingestion run doctor
npm --prefix tools/question-ingestion run ingest
```

## Scope

- source adapter scaffolding
- normalized ingestion types
- CLI entrypoints for doctor and ingest

This package is intentionally isolated from the Electron app runtime.
