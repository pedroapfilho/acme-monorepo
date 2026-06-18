// Drizzle wraps pg errors in DrizzleQueryError; unwrap to get the underlying cause.
const extractPgCode = (err: unknown): string | undefined => {
  if (typeof err !== "object" || err === null) {
    return undefined;
  }
  if ("cause" in err) {
    const cause = (err as { cause: unknown }).cause;
    if (typeof cause === "object" && cause !== null && "code" in cause) {
      const code = (cause as { code: unknown }).code;
      if (typeof code === "string" && /^\d{5}$/v.test(code)) {
        return code;
      }
    }
  }
  if ("code" in err) {
    const code = (err as { code: unknown }).code;
    if (typeof code === "string" && /^\d{5}$/v.test(code)) {
      return code;
    }
  }
  return undefined;
};

export { extractPgCode };
