const displayName = "Acme";

const slug = "acme";

const origins = {
  apex: "https://acme.com",
  api: "https://api.acme.com",
  landing: "https://www.acme.com",
} as const;

const contacts = {
  security: "security@acme.com",
  support: "support@acme.com",
} as const;

export { contacts, displayName, origins, slug };
