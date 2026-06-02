# Deslop & Standardization — Design Spec

**Date:** 2026-05-26
**Status:** Draft, pending user review
**Scope:** Monorepo-wide cleanup pass to remove low-value patterns, unify conventions, and codify defaults.

## Goal

Reduce code-review friction and prevent future "which way do we do this?" debates by:

1. Removing structural slop (single-use classes, thin wrappers, repeated literals, dead code/deps).
2. Standardizing cross-cutting patterns (error handling, response envelope, file organization).
3. Trimming AI-slop comments and replacing type-gymnastics casts with typed helpers.
4. Writing a `CONVENTIONS.md` so the chosen defaults become reviewable.

## Non-goals

- No new features. No role/permission system (the TODO at `apps/api/src/routes/v1/users.ts:138` documents current behavior accurately and stays).
- No bundler/lint/format config changes.
- No production code behavior changes beyond the response-envelope normalization on `DELETE /me` and the error-propagation change in `auth-helpers.ts`.
- No Prisma schema changes.
- No test framework migrations.

## Delivery shape

Three independent PRs, designed to minimize file-level overlap so they can land in any order:

| PR    | Theme                                                                | Risk   |
| ----- | -------------------------------------------------------------------- | ------ |
| **A** | Structural + dead deps + api file rename                             | Medium |
| **B** | Pattern standardization + transactional file rename + CONVENTIONS.md | Higher |
| **C** | Comment + cast hygiene                                               | Low    |

The api `services/` → `lib/` rename is folded into PR A (it owns `user.service.ts` already) so PR B doesn't touch the same file. PR B owns the transactional `utils/` → `lib/` rename and the new conventions doc.

---

## PR A — Structural cleanup + dead deps + api rename

### Changes

1. **Collapse `UserService` class.**
   - Delete `apps/api/src/services/user.service.ts`.
   - Create `apps/api/src/lib/users.ts` exporting module-level async functions:
     - `findUserById(id: string)`
     - `findUserByEmail(email: string)`
     - `updateUser(id: string, data: Prisma.UserUpdateInput)`
     - `deleteUser(id: string)`
   - Extract a single `userSelect` constant (`satisfies Prisma.UserSelect`) used by `findUserById`, `findUserByEmail`, `updateUser`. The selects currently differ in whether they include `updatedAt`; unify on the superset.
   - Drop the unused `list()` method (the route handler doesn't call it and its return shape doesn't match the route schema).

2. **Update call sites in `apps/api/src/routes/v1/users.ts`.**
   - Import the named functions instead of `userService`.
   - Update `ServiceUser = Awaited<ReturnType<typeof findUserById>>`.

3. **Move + update `apps/api/src/services/user.service.test.ts` → `apps/api/src/lib/users.test.ts`.**
   - Drop the `list()` test cases.
   - Rewrite call sites from `userService.findById(...)` → `findUserById(...)`, etc.
   - Confirm `pnpm --filter api test` still green.

4. **Delete `packages/transactional/src/client.ts` and its re-export.**
   - The `createResendClient` wrapper is a 5-line throw-if-empty check. Env validation already rejects an empty `RESEND_API_KEY` at boot, so the runtime guard is redundant.
   - Replace import sites in `packages/transactional/src/utils/send-email.ts` with `new Resend(apiKey)` directly.
   - Remove the `export { createResendClient } from "./client"` line from `packages/transactional/src/index.ts` (no external consumers — grep confirms).

5. **Fix phantom dep on `lucide-react`.**
   - Remove from `packages/ui/package.json` dependencies.
   - `apps/web/package.json` and `apps/landing/package.json` already list it correctly — no additions needed.

6. **Remove `@tanstack/react-form` unused devDep from `packages/auth/package.json`.**

### Verification

- `pnpm install`
- `pnpm typecheck` → clean
- `pnpm test` → 116/116 still passing
- `pnpm fallow:dead` → no new findings
- `pnpm build` → clean
- Manual smoke (optional): hit `GET /api/v1/me` once locally to confirm the route still returns expected shape

### Risk + rollback

- Medium risk: changes the public Service interface, but only one route file consumes it. Rollback = revert the PR.
- Behavior unchanged: same error codes, same response shapes, same logging.

---

## PR B — Pattern standardization + transactional rename + CONVENTIONS.md

### B1. Normalize `DELETE /me` to 204 No Content

- Update `deleteMeRoute` in `apps/api/src/routes/v1/users.ts`:
  - Response declared as `204: { description: "Account deleted" }` (no content schema).
  - Handler returns `c.body(null, 204)`.
- No e2e test changes needed — `tests/e2e/api/users.spec.ts` does not currently cover `DELETE /me`.

### B2. Stop swallowing in `apps/web/src/lib/auth-helpers.ts`

- Remove the try/catch and the `console.error` line.
- Let Better Auth's behavior speak for itself: `null` for "no session", thrown for real failures.
- Next.js + Vercel already capture thrown errors with stack traces; no app-level logger needed in web.

### B3. File-org standardization

- **api**: rename happens in PR A (`services/user.service.ts` → `lib/users.ts`); PR B does nothing here.
- **transactional**: rename `packages/transactional/src/utils/` → `packages/transactional/src/lib/`. Update internal imports.
- **other packages**: already conform — no changes needed.

### B4. Write `docs/CONVENTIONS.md`

Short reference doc capturing the defaults. Final content lives in the PR; outline:

```
# Conventions

## API responses
- Success: `{ data: ... }` envelope, or `204 No Content` when there is no payload.
- Error: `{ error: { code, message, details? } }` from the central error handler in `apps/api/src/middleware/error-handler.ts`. Never return ad-hoc error shapes from a route handler.

## Errors
- Never swallow into `null`, `{}`, or empty arrays.
- In api middleware/handlers: throw `HTTPException` or `AppError`; the central handler renders.
- In Next.js RSC helpers: let it throw; Next.js renders `error.tsx` and Vercel captures the stack.
- `console.error` is not a logger. The api uses `c.var.logger` (from `@hono/structured-logger`); web relies on thrown-error capture.

## File organization
- One `lib/` folder per app and package. No `services/`, no `utils/`.
- Filename = subject. `users.ts`, not `user.service.ts`.

## Service shape
- Prefer module-level exported async functions.
- Reach for a class only when there is real per-instance state (rare).

## Comments
- WHY-only. No WHAT-comments.
- No historical references ("added for #93", "removed X", "previously did Y").
- One short line is the norm; multi-line comment blocks need real justification.

## Test mocks
- No `as unknown as X` casts to fake framework types.
- Shared typed helpers per package (e.g. `apps/api/src/middleware/test-helpers.ts`).
```

### Verification

- `pnpm typecheck` → clean
- `pnpm test` → still 116/116
- `pnpm test:e2e` → unchanged (no existing e2e covers `DELETE /me`)
- Manual smoke: hit `DELETE /api/v1/me` locally and confirm 204; force a session-fetch error in dev and confirm `error.tsx` renders instead of a silent null session

### Risk + rollback

- Higher risk than A because of the auth-helpers behavior change (failures now surface instead of returning `null`).
- Rollback = revert the PR.

---

## PR C — Comment + cast hygiene

### C1. Comment trim pass

| File                              | Lines (current) | Action                                                                             |
| --------------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `packages/auth/src/server.ts`     | 59-71           | Compress 12-line cookie-Secure block → one sentence on the reverse-proxy edge case |
| `apps/api/src/lib/env.ts`         | 19-22           | Drop the "throwing vs `process.exit`" defense; code is self-explanatory            |
| `apps/api/src/middleware/auth.ts` | 81-83           | Keep the "must not be silent" WHY; drop the parenthetical examples list            |

Then a quick sweep of the rest of the codebase for the same shape: verbose JSDoc explaining trivial behavior, history references, redundant `// returns: ...` lines, "added for X" tags.

### C2. Typed Context mock helper

- New file: `apps/api/src/middleware/test-helpers.ts`

  ```ts
  type MockContextOptions = {
    headers?: Record<string, string>;
    variables?: Record<string, unknown>;
  };

  export const createMockContext = (opts: MockContextOptions = {}) => {
    const variables = new Map<string, unknown>(Object.entries(opts.variables ?? {}));
    const logger = { error: vi.fn(), info: vi.fn() };

    return {
      get: vi.fn((key: string) => variables.get(key)),
      set: vi.fn((key: string, value: unknown) => {
        variables.set(key, value);
      }),
      var: { logger },
      req: {
        header: vi.fn((name: string) => opts.headers?.[name]),
        method: "GET",
        path: "/test",
        url: "http://localhost/test",
      },
      json: vi.fn((body: unknown, status?: number) => ({ body, status })),
    } satisfies Partial<Context>;
  };
  ```

- Each of `auth.test.ts`, `error-handler.test.ts`, `security.test.ts` drops its local `createMockContext` and imports from the helper.
- The `as unknown as Context` casts go away (`satisfies Partial<Context>` is the proper escape hatch).

### Verification

- `pnpm test` → still 116/116
- `pnpm typecheck` → clean

### Risk + rollback

- Low. Comment trims and test-only refactor.

---

## Sequencing & merge order

Any order. The only file-overlap risk between PR A and PR B was `services/user.service.ts`; by folding the rename into PR A, B no longer touches that path. PR C only touches test files and comment-internal text — independent of both.

## Out of scope (deliberate)

- Adding a real role/permission system for `listUsersRoute`.
- Web-side structured logger (deferred until throw-on-failure isn't enough).
- Renaming the `apps/api/src/middleware/` folder (it's already conventional).
- The `apps/landing` directory tree (already conforms).
- Dependency version bumps.

## Success criteria

- All three PRs merged with green CI (`lint`, `format:check`, `test`, `fallow:dead`).
- `pnpm fallow:dead` finds nothing new.
- `docs/CONVENTIONS.md` exists and is linked from the root `README` (or `CLAUDE.md`).
- A new dev reading the repo can answer: "where does X go?", "how do errors flow?", "what's the response shape?" — by pointing at `CONVENTIONS.md`.
