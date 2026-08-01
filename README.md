# Media Catalogue

A private, single-user catalogue for images and manga. This repository currently contains the Phase 3 TypeScript data layer and browser-side catalogue search with fictional local fixtures; image viewing, authentication, R2 integration, and deployment will be added in later verified stages.

The full product and delivery plan is documented in [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md).

## Requirements

- Node.js 22 or newer
- npm 10 or newer

## Local development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The application includes routes for the image and manga catalogues.

## Verification

```bash
npm run lint
npm run test
npm run build
```

## Repository safety

- Use only fictional sample data in this repository.
- Do not commit media files, real catalogue JSON, `.env`, Cloudflare credentials, passwords, or session secrets.
- Production metadata will live in Private R2 and be returned only by an authenticated Worker API.

## Current phase

Phase 3 — Shared browser-side catalogue search for titles, tags, and manga authors, with case-insensitive English and partial Chinese/Japanese matching.
