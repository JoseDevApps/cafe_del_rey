# AGENTS.md

## Project reality (don not guess)
- This is a single repo with two runtimes: Next.js 16 frontend at root and FastAPI backend in `api/`.
- The user-facing app is expected on `http://localhost:4001` in the full-stack flows (not 3000).
- Backend serves product data + uploads; frontend consumes it and proxies upload images through Next routes.

## High-value commands
- Frontend only: `npm run dev` (default Next port 3000).
- Frontend quality checks: `npm run lint`, `npm run build`.
- TypeScript check (no npm script exists): `npx tsc --noEmit`.
- Full stack with containers: `make up` (Docker) or `make podman-up` (Podman).
- Windows native full stack: run `deploy/windows/setup.ps1` once, then `deploy/windows/start-dev.ps1`.

## Verified architecture constraints
- API entrypoint is `api/main.py`; startup lifecycle creates uploads dir, initializes SQLite DB, and seeds default products.
- DB is SQLite at `DB_PATH` (container default `/app/data/cafe.db`), persisted via compose volume `db_data`.
- Admin auth token is stored in cookie `admin_token`; admin route protection is in `proxy.ts` (Next 16, renamed from `middleware.ts`).
- Product images must flow through `app/api/uploads/[...path]/route.ts` and `types/api.ts:toProxyUrl()`; do not wire browser image URLs directly to `http://api:8000`.

## Environment variables that change behavior
- Frontend server-side API base: `API_INTERNAL_URL` (preferred), fallback `NEXT_PUBLIC_API_URL`, then `http://localhost:8000`.
- Browser API base: `NEXT_PUBLIC_API_URL`.
- API auth/config: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRE_HOURS`, `ALLOWED_ORIGINS`, `UPLOADS_DIR`, `DB_PATH`.

## Gotchas likely to cause wrong edits
- Keep Next.js 16 proxy conventions: route guard lives in `proxy.ts` and exports `proxy()`.
- If you change API URL behavior, update both server-side fetch locations (`types/api.ts`, `app/actions/admin.ts`, upload proxy route).
- If you add external image hosts, update `next.config.ts` `images.remotePatterns`.
- There is no established automated test suite in repo config; use focused verification (lint/build/targeted manual checks) and state what you ran.
