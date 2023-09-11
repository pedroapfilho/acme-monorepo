import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen flex-1 flex-col justify-center bg-neutral-50 py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  );
};

export default Layout;
