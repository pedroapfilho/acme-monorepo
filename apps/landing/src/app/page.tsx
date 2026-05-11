import { buttonVariants } from "@repo/ui/components/button";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import { webAppUrl } from "@/lib/urls";

export const metadata: Metadata = {
  description: "Welcome to Acme — the one template to rule them all.",
  title: "Home",
};

const Page = () => {
  return (
    <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-16 px-6 py-20 md:px-8 md:py-28">
      <section className="flex flex-col gap-8">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Acme template
        </p>
        <h1 className="max-w-[20ch] text-5xl font-semibold tracking-tight text-balance md:text-6xl">
          The one template to rule them all.
        </h1>
        <p className="max-w-[48ch] text-lg text-pretty text-muted-foreground md:text-xl">
          A Next.js monorepo baseline with Better Auth, Prisma, and shadcn/ui: configured, tested,
          and ready to fork.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a className={buttonVariants({ size: "lg" })} href={webAppUrl("/register")}>
            Get started
          </a>
          <a
            className={buttonVariants({ size: "lg", variant: "ghost" })}
            href={webAppUrl("/login")}
          >
            Sign in
            <ArrowUpRight />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Page;
