# Conventions

This document records the defaults used across the acme monorepo. New code should follow them; existing code that diverges is a candidate for a slop-cleanup pass.

## API responses

- Success with a body: `{ data: ... }`. The envelope makes it easy to add `meta` later without breaking clients.
- Success with no body: `204 No Content`. Used by `DELETE /api/v1/me` and other operations that have no useful payload.
- Errors: `{ error: { code, message, details? } }`, produced exclusively by the central error handler in `apps/api/src/middleware/error-handler.ts`. Route handlers throw `AppError`, `HTTPException`, or let Zod / Prisma errors propagate; they never return error-shaped JSON directly.

## Errors

- Never swallow into `null`, `{}`, or empty arrays. A returned-null on the success path is fine when it means "no row"; a returned-null in a catch block is silent failure.
- In api middleware and route handlers: throw `HTTPException` (for HTTP-specific errors) or `AppError` (for domain errors). The central handler renders the response and logs via `c.var.logger`.
- In Next.js RSC helpers (e.g. `apps/web/src/lib/auth-helpers.ts`): do not wrap in try/catch unless you are handling a _specific_ expected error. Let unknown failures propagate; Next.js renders `error.tsx` and Vercel captures the stack with full context.
- `console.error` is not a logger. The api uses `c.var.logger` (from `@hono/structured-logger`); the web app relies on Next.js + Vercel error capture for thrown exceptions.

## File organization

- One `lib/` folder per app and per package. No `services/`, no `utils/`, no `helpers/`.
- Filename equals subject: `users.ts`, not `user.service.ts` or `userHelpers.ts`.
- Tests sit next to the file they cover: `users.ts` + `users.test.ts`.

## Service shape

- Prefer module-level exported async functions.
- Reach for a class only when there is real per-instance state (rare in our codebase; Prisma's singleton and Better Auth's instance are the only current examples, both encapsulated in their own packages).

## Comments

- WHY-only. The code already says WHAT.
- No historical references: don't write "added for #93", "removed X", "previously did Y". Those belong in the PR description and git log.
- One short line is the norm. Multi-line comment blocks need real justification (a non-obvious invariant, a hidden constraint, a subtle workaround).

## Test mocks

- No `as unknown as X` casts to fake framework types in test files. Use shared typed helpers (e.g. `apps/api/src/middleware/test-helpers.ts`).
- Mocks should be the minimum needed for the test. If a test only needs `c.set` and `c.var.logger`, the helper should only expose those.

## Forms

- `@tanstack/react-form`, never `react-hook-form`.
- Validate `onBlur` + `onChange` with Zod schemas.
- Display errors with `field.state.meta.isTouched && !field.state.meta.isValid`.
- Never call `field.handleChange` inside `useEffect` or `useCallback` with `field` in deps; use `field.form.setFieldValue(field.name, value)` with stable refs.

## Tooling

- Linter: oxlint. Not ESLint.
- Formatter: oxfmt. Not Prettier.
- Bundler (api): tsdown.
- Bundler (web/landing): Next.js' Turbopack in dev, native in build.

## Routes

- API versioned under `/api/v1/*`. Better Auth at `/auth/*`. Health at `/healthz` and `/readyz`.
- Path alias: `@/*` maps to `src/*` in every app and package.
