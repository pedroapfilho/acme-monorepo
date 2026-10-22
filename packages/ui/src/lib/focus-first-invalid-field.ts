const focusFirstInvalidField = (formId: string) => {
  // A submit handler runs before React renders the aria-invalid and enabled state it just set.
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(`[id="${formId}"] [aria-invalid="true"]`)?.focus();
  });
};

export { focusFirstInvalidField };
