type Access = "guest" | "public" | "signed-in";

// reset-password is public, not guest: bouncing a visitor who still holds a session would make the emailed link unusable.
const routes = {
  dashboard: { access: "signed-in", path: "/dashboard" },
  login: { access: "guest", path: "/login" },
  recover: { access: "guest", path: "/recover" },
  register: { access: "guest", path: "/register" },
  resetPassword: { access: "public", path: "/reset-password" },
  settings: { access: "signed-in", path: "/dashboard/settings" },
} as const satisfies Record<string, { access: Access; path: `/${string}` }>;

const HOME_PATH = routes.dashboard.path;

const PASSWORD_RESET_NOTICE = "password-reset-success";

const covers = (route: { access: Access; path: string }, pathname: string) =>
  pathname === route.path ||
  (route.access === "signed-in" && pathname.startsWith(`${route.path}/`));

const routeAccess = (pathname: string): Access =>
  Object.values(routes).find((route) => covers(route, pathname))?.access ?? "public";

export { HOME_PATH, PASSWORD_RESET_NOTICE, routeAccess, routes };
