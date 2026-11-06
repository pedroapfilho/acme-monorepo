const SITE_NAME = "Acme";

const SHORT_DESCRIPTION = "The one template to rule them all";

const LONG_DESCRIPTION = "Monorepo for base projects";

const TWITTER_HANDLE = "acme";

const SITE_URL = "https://www.acme-monorepo.com";

const SECTIONS = [
  { id: "capabilities", label: "Capabilities" },
  { id: "structure", label: "Structure" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export { LONG_DESCRIPTION, SECTIONS, SHORT_DESCRIPTION, SITE_NAME, SITE_URL, TWITTER_HANDLE };

export type { SectionId };
