const CONTROL = "input, select, textarea, button, [tabindex]";

const focusFirstInvalidField = (formId: string) => {
  // A submit handler runs before React renders the aria-invalid and enabled state it just set.
  requestAnimationFrame(() => {
    const invalid = document.querySelector<HTMLElement>(`[id="${formId}"] [aria-invalid="true"]`);

    if (invalid === null) {
      return;
    }

    const control = invalid.matches(CONTROL)
      ? invalid
      : invalid.querySelector<HTMLElement>(CONTROL);

    control?.focus();
  });
};

export { focusFirstInvalidField };
