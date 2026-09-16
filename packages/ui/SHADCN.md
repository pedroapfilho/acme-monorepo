# Shared components

`src/components` contains the installed shadcn Base UI registry components for the style in `components.json`. Preserve upstream module names, exports, prop types/defaults, DOM semantics, and interactions. Variant factories are exported beside their component, such as `Button` and `buttonVariants` from `components/button`.

Put product-specific compositions and adapters in `src/compositions`, helpers in `src/lib`, and hooks in `src/hooks`. For example, `FormFieldError` converts arbitrary TanStack validator values to the upstream `FieldError` message shape. Use normal headings inside `CardTitle`; its upstream element is a generic div. Import `toast` from `sonner`.

The template uses the [shadcn neutral palette](https://ui.shadcn.com/r/colors/neutral.json) in `src/styles/globals.css` for light and dark modes, including grayscale charts. Sidebar primary colors follow the neutral primary/foreground pair in both modes. Destructive/error states retain shadcn's semantic red; do not add a brand accent to this template. Load `shadcn/tailwind.css`: the registry depends on its data-state/orientation variants and utilities.

All six design-system lint rules remain enabled. The reviewed source normalizations preserve the upstream contract:

- Use repository formatting, declaration order, and import aliases. Omit redundant client boundaries on wrappers that have no hooks.
- Replace arbitrary values with named tokens/utilities carrying the same CSS declarations and selectors.
- Compose FieldLabel at the native label layer with the same merged Label and FieldLabel classes; the strict contract prohibits restyling the exported Label.
- Resolve registry styling markers. Sonner's four CSS variables live in the `toaster` utility, while the Nova toast radius is `rounded-2xl`.
- Narrow theme values and make boolean conditions explicit without unchecked assertions. Respect reduced motion for the loading icon.

`shadcn.lock.json` records the reviewed upstream revision, registry-payload hashes, installed-source hashes, and CSS declarations required by the normalizations. `pnpm check:shadcn` runs in CI and rejects modified/missing components, unregistered primitives, and missing CSS declarations. Brand tokens are intentionally outside the CSS contract.

For an upstream update, install the configured registry entry and its dependencies, review the API and source changes, apply the documented normalizations, migrate callers, and run lint, formatting, typechecks, tests, and a production build. Update the lock only after reviewing that upstream change; do not refresh hashes to bless a product-specific fork.
