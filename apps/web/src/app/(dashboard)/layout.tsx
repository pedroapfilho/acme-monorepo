import { ReactNode } from "react";

const Layout = async ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};

export default Layout;
