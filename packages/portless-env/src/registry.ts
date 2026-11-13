const apps = {
  api: { name: "acme.api", port: 4000 },
  landing: { name: "acme.landing", port: 3001 },
  web: { name: "acme.web", port: 3000 },
} as const;

const urlEnv = {
  CORS_ORIGINS: ["web", "landing"],
  NEXT_PUBLIC_WEB_APP_URL: ["web"],
  WEB_APP_URL: ["web"],
} as const satisfies Record<string, ReadonlyArray<keyof typeof apps>>;

export { apps, urlEnv };
