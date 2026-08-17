import { buttonVariants } from "@repo/ui/components/button-variants";
import { cn } from "@repo/ui/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

/** @public Next.js app-router reads metadata via the module loader */
export const metadata: Metadata = {
  title: "Page not found",
};

const NotFound = () => (
  <section className="py-24 md:py-32">
    <div className="mx-auto max-w-5xl px-6 md:px-8">
      <p className="font-mono text-sm tracking-wide text-primary uppercase">Error 404</p>
      <h1 className="mt-4 max-w-[35ch] text-3xl font-semibold tracking-tight text-balance md:text-4xl">
        Page not found.
      </h1>
      <p className="mt-4 max-w-[48ch] text-lg text-pretty text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }), "mt-8")} href="/">
        Go home
      </Link>
    </div>
  </section>
);

export default NotFound;
