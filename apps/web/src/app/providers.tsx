"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <AuthProvider>{children}</AuthProvider>
    </ErrorBoundary>
  );
};

export { Providers };