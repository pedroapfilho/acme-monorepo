import type { Metadata } from "next";
import { ViewTransition } from "react";

export const metadata: Metadata = {
  description: "Welcome to Acme — the one template to rule them all.",
  title: "Home",
};

const Page = () => {
  return (
    <ViewTransition
      default="none"
      enter={{ default: "none", "nav-back": "nav-back", "nav-forward": "nav-forward" }}
      exit={{ default: "none", "nav-back": "nav-back", "nav-forward": "nav-forward" }}
    >
      <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-8 px-4 sm:px-6 lg:px-8">
        content
      </div>
    </ViewTransition>
  );
};

export default Page;
