const focusFirstInvalidField = (form: HTMLFormElement | null) => {
  // TanStack calls onSubmitInvalid before React renders the new aria-invalid and disabled states.
  requestAnimationFrame(() => {
    form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
};

export { focusFirstInvalidField };
