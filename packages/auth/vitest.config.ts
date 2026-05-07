// React env (jsdom + @testing-library/react) so auth-form-fields.test.tsx
// runs alongside the node-style server.test.ts. The server tests have no
// DOM dependencies, so jsdom is a benign superset for them.
import reactConfig from "@repo/config-vitest/react";

export default reactConfig;
