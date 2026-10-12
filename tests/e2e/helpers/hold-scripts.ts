import type { Page } from "@playwright/test";

const holdScripts = async (page: Page) => {
  const scripts = Promise.withResolvers<undefined>();
  await page.route("**/_next/static/**/*.js", async (route) => {
    await scripts.promise;
    await route.continue();
  });
  return () => {
    scripts.resolve(undefined);
  };
};

export { holdScripts };
