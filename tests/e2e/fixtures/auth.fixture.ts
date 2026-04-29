import { test as base } from "@playwright/test";

import { DashboardPage } from "../pages/dashboard.page";
import { LoginPage } from "../pages/login.page";
import { RecoverPage } from "../pages/recover.page";
import { RegisterPage } from "../pages/register.page";
import { ResetPasswordPage } from "../pages/reset-password.page";

type Fixtures = {
  dashboardPage: DashboardPage;
  loginPage: LoginPage;
  recoverPage: RecoverPage;
  registerPage: RegisterPage;
  resetPasswordPage: ResetPasswordPage;
};

const test = base.extend<Fixtures>({
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
});

export { test };
export { expect } from "@playwright/test";
