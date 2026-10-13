import { portlessUrl } from "@repo/portless-env";
import { loopbackUrl } from "@repo/portless-env/apps";
import type { App } from "@repo/portless-env/apps";

const appUrl = (app: App) => (process.env.CI ? loopbackUrl(app, "127.0.0.1") : portlessUrl(app));

export const webUrl = process.env.PLAYWRIGHT_WEB_URL ?? appUrl("web");
export const apiUrl = appUrl("api");
export const landingUrl = appUrl("landing");
