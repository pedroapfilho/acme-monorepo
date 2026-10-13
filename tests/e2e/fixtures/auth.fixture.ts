import { DashboardPage } from "../pages/dashboard.page";
import { LoginPage } from "../pages/login.page";
import { RecoverPage } from "../pages/recover.page";
import { RegisterPage } from "../pages/register.page";
import { ResetPasswordPage } from "../pages/reset-password.page";
import { SettingsPage } from "../pages/settings.page";

import { test as sessionTest } from "./session";

type Fixtures = {
  dashboardPage: DashboardPage;
  loginPage: LoginPage;
  recoverPage: RecoverPage;
  registerPage: RegisterPage;
  resetPasswordPage: ResetPasswordPage;
  settingsPage: SettingsPage;
};

const test = sessionTest.extend<Fixtures>({
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  recoverPage: async ({ page }, use) => {
    await use(new RecoverPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  resetPasswordPage: async ({ page }, use) => {
    await use(new ResetPasswordPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
});

export { test };
export { expect } from "@playwright/test";
