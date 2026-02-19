import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Welcome to Acme — the one template to rule them all.",
  title: "Home",
};

const Page = () => {
  return (
    <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-8 px-4 sm:px-6 lg:px-8">
      content
    </div>
  );
};

export default Page;
