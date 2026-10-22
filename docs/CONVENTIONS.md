# Conventions

This document records the defaults used across the acme monorepo. New code should follow them; existing code that diverges is a candidate for a slop-cleanup pass.

## API responses

- Success with a body: `{ data: ... }`. The envelope makes it easy to add `meta` later without breaking clients.
- Success with no body: `204 No Content`. Used by `DELETE /api/v1/users/me` and other operations that have no useful payload.
- Errors: `{ error: { code, message, details? } }`, produced exclusively by the central error handler in `apps/api/src/lib/api-error.ts`. Route handlers and middleware throw `AppError` with a distinct `code`, or let Zod, Better Auth and Prisma errors propagate; they never return error-shaped JSON directly. Routers come from `createRouter()` in `apps/api/src/lib/openapi.ts`, whose `defaultHook` sends request validation failures to the same handler.

## Errors

- Never swallow into `null`, `{}`, or empty arrays. A returned-null on the success path is fine when it means "no row"; a returned-null in a catch block is silent failure.
- In api middleware and route handlers: throw `AppError`. The central handler renders the response; the evlog request logger records the error on the request's wide event.
- In Next.js RSC helpers (e.g. `apps/web/src/lib/auth-helpers.ts`): do not wrap in try/catch unless you are handling a _specific_ expected error. Let unknown failures propagate; Next.js renders `error.tsx` and Vercel captures the stack with full context.
- `console.error` is not a logger. The api uses the evlog request logger (`c.get("log")`); the web app relies on Next.js + Vercel error capture for thrown exceptions.

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

- No `as unknown as X` casts to fake framework types in test files.
- Test the api through `createApp(fakeDeps).request(...)` and assert status and body. Fake only the collaborators in `AppDeps` (session lookup, user store, database check), never Hono's `Context`.

## Forms

- `@tanstack/react-form`, never `react-hook-form`.
- Schemas are the single source of validation: no HTML `required` or `minLength`; keep `noValidate` on the form, `type="email"` for keyboard hints, and `type="submit"` on submit buttons. Derive `aria-required` from the field schema and subscribe to form-derived state through `form.useStore()`.
- Auth forms and auth action buttons are built on `apps/web/src/components/auth-form.tsx`, which owns the double-submit latch, Better Auth error reporting and the busy state.
- Validation follows six rules. `useAuthForm` and `field.TextField` implement them, so a call site passes a schema, a label, an `autoComplete` purpose and any `description`:
  1. Validate on submit, then on every change: `validationLogic: revalidateLogic()` with `validators: { onDynamicAsync: schema }`. No error shows before the first submit attempt, and after a failed one an error clears on the keystroke that fixes it. Never validate on blur. The validator is async because Zod returns a rejected promise when a refinement throws, and the async validator turns it into an error instead of an unhandled rejection.
  2. Show a field's error whenever `!field.state.meta.isValid`. Don't add an `isTouched`, `isBlurred` or `submissionAttempts` check: rule 1 already holds errors back until submit.
  3. On a failed submit, `onSubmitInvalid` calls `focusFirstInvalidField(formApi.formId)` from `@repo/ui/lib/focus-first-invalid-field`, and the form renders with `id={form.formId}` (React's `useId`, so server and client agree). The helper focuses the form's first `[aria-invalid="true"]` control a frame later, because TanStack calls `onSubmitInvalid` before React renders the invalid state, while controls may still be disabled. Call `form.handleSubmit()` outside `startTransition`; start the transition inside `onSubmit`.
  4. Explain any rule people can't guess (password length, allowed characters, formats) with helper text under the field from the start: `field.TextField`'s `description`, rendered as a `FieldDescription` the input is described by. Live hints such as a strength meter derive from the value; they are not validation errors.
  5. Server-only failures (wrong password, email taken, rate limits) arrive on submit. Attach each one to its field, or render it in `FormAlert` from `@repo/ui/compositions/form-alert` at the top of the form, as `AuthForm` does, and clear it on the next change through the form's `listeners.onChange`. Never report a submit failure in a toast: toasts are for successes and for actions outside a form, such as `AuthActionButton`. Keep auth failures generic.
  6. Keep the submit button enabled, and disable it only while submitting. Never disable it on `!canSubmit` or `!isValid`: a disabled button can't say which field is wrong. The one exception is a form with exactly one editable field, which may also disable submit while that field's trimmed value is empty or unchanged; use it only where empty is the obvious error, such as a "name your workspace" dialog. A form with more than one editable field never disables submit while unchanged: an unchanged submit sends nothing and says so in `FormAlert`. A client-side throttle refuses an early submit with a `FormAlert` instead of disabling the button.
- Never call `field.handleChange` inside `useEffect` or `useCallback` with `field` in deps; use `field.form.setFieldValue(field.name, value)` with stable refs.

## Tooling

- Linter: oxlint. Not ESLint.
- Formatter: oxfmt. Not Prettier.
- Bundler (api): tsdown.
- Bundler (web/landing): Next.js' Turbopack in dev, native in build.

## Routes

- API versioned under `/api/v1/*`, with health at `/healthz` and `/readyz`. Better Auth is served by `web` at `/api/auth/*`; `api` only consumes its session and user APIs.
- Path alias: `@/*` maps to `src/*` in every app and package.
