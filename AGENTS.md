# Media Catalogue repository instructions

Read `docs/PROJECT_PLAN.md` before making architectural or scope decisions.

## Product boundaries

- This is a single-user catalogue for images and manga.
- Video catalogue functionality is a possible future expansion and is outside the current product scope.
- Keep real metadata and media files out of Git and frontend build artifacts.
- Use only neutral, fictional fixtures in the repository.
- Never commit `.env`, passwords, session secrets, R2 credentials, real catalog JSON, or sensitive media.
- Public media object keys must be UUIDs or similarly unguessable values.
- The final product protects real metadata with server-side authentication. Never implement a frontend-only password check.

## Technical conventions

- Use React, TypeScript in strict mode, Vite, and React Router.
- Use native CSS or CSS Modules. Do not add Tailwind or a UI component library.
- Do not use `any`; validate external data at runtime with Zod once the data layer is introduced.
- Keep shared behavior in focused components, hooks, and utilities rather than copying it across pages.
- Preserve keyboard access, visible focus, semantic HTML, and responsive behavior.
- Do not add a database, analytics, registration, or multi-user account system unless the project plan is explicitly revised.
- Do not introduce real Cloudflare credentials or production data during local development.

## Scope discipline

- Implement only the current delivery phase from `docs/PROJECT_PLAN.md`.
- Do not add later-phase features speculatively.
- Update the plan or README when an accepted decision changes the architecture or workflow.

## Verification

- Run `npm run lint` after source changes.
- Run relevant tests when tests exist.
- Run `npm run build` before finishing every implementation task.
- Report failures and remaining risks clearly.
- Do not commit, push, deploy, or alter remote services unless the user explicitly asks.
