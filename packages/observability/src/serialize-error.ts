type SerializedError = {
  cause?: unknown;
  code?: number | string;
  digest?: number | string;
  message: string;
  name: string;
  stack?: string;
};

const codeOf = (error: Error) =>
  "code" in error && (typeof error.code === "string" || typeof error.code === "number")
    ? error.code
    : undefined;

const digestOf = (error: Error) =>
  "digest" in error && (typeof error.digest === "string" || typeof error.digest === "number")
    ? error.digest
    : undefined;

const serialize = (cause: unknown, seen: WeakSet<Error>): SerializedError => {
  if (!(cause instanceof Error)) {
    return { cause, message: "Non-Error value thrown", name: "NonError" };
  }

  if (seen.has(cause)) {
    return { message: cause.message, name: cause.name };
  }

  seen.add(cause);

  return {
    cause: cause.cause instanceof Error ? serialize(cause.cause, seen) : cause.cause,
    code: codeOf(cause),
    digest: digestOf(cause),
    message: cause.message,
    name: cause.name,
    stack: cause.stack,
  };
};

// evlog writes an Error held in a field, or in another error's `cause`, as `{}`.
const serializeError = (cause: unknown): SerializedError => serialize(cause, new WeakSet());

export { serializeError };
