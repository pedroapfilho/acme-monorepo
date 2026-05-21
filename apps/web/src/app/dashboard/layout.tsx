import type { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <main id="main-content">{children}</main>;
};

export default Layout;
