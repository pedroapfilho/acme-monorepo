import type { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <main
      className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10"
      id="main-content"
    >
      <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
    </main>
  );
};

export default Layout;
