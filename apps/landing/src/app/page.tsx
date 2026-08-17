import { buttonVariants } from "@repo/ui/components/button-variants";
import { ArrowUpRight, Database, KeyRound, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { webAppUrl } from "@/lib/urls";

const metadata: Metadata = {
  description:
    "A Next.js monorepo baseline with Better Auth, Prisma, and shadcn/ui: configured, tested, and ready to fork.",
  title: { absolute: "Acme: The one template to rule them all" },
};

/** @public Next.js App Router consumes this route config through the module loader. */
export const instant = true;

const STACK = [
  "Next.js 16",
  "Hono",
  "Better Auth",
  "Prisma",
  "shadcn/ui",
  "Turborepo",
  "Vitest",
  "Playwright",
];

const CAPABILITIES = [
  {
    description:
      "Email and password sign-in, verification, and seven-day sessions, shared between the app and the API.",
    icon: KeyRound,
    title: "Authentication",
  },
  {
    description:
      "Prisma against Postgres with a generated client, seed data, and migrations already in the build graph.",
    icon: Database,
    title: "Data layer",
  },
  {
    description:
      "Strict TypeScript, lint, unit tests, and browser tests run on every branch before it reaches main.",
    icon: ShieldCheck,
    title: "Quality gates",
  },
];

const WORKSPACES = [
  { detail: "The product surface, on the App Router.", name: "apps/web" },
  { detail: "A Hono REST API with OpenAPI docs.", name: "apps/api" },
  { detail: "This marketing site, with no runtime config.", name: "apps/landing" },
  { detail: "Auth, database, UI, and email, shared by all of them.", name: "packages/*" },
];

const Page = () => {
  return (
    <>
      <section className="py-20 md:py-28">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 md:px-8">
          <p className="font-mono text-sm tracking-wide text-primary uppercase">Acme template</p>
          <div>
            <h1 className="max-w-[24ch] text-5xl font-semibold tracking-tight text-balance md:text-6xl">
              The one template to rule them all.
            </h1>
            <p className="mt-6 max-w-[44ch] text-lg text-pretty text-muted-foreground md:text-xl">
              A Next.js monorepo baseline with Better Auth, Prisma, and shadcn/ui: configured,
              tested, and ready to fork.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a className={buttonVariants({ size: "lg" })} href={webAppUrl("/register")}>
              Get started
            </a>
            <a
              className={buttonVariants({ size: "lg", variant: "outline" })}
              href={webAppUrl("/login")}
            >
              Sign in
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <p className="text-base text-muted-foreground sm:text-sm">
            Auth, database, email, and observability ship connected.
          </p>
        </div>
      </section>

      <section className="border-t border-border py-10">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <p className="font-mono text-sm tracking-wide text-primary uppercase">Built on</p>
          <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-base font-medium sm:text-sm">
            {STACK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border py-20 md:py-24" id="capabilities">
        <div className="mx-auto max-w-5xl px-6 md:px-8">
          <div>
            <p className="font-mono text-sm tracking-wide text-primary uppercase">What you get</p>
            <h2 className="mt-4 max-w-[35ch] text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              The hard parts are already connected.
            </h2>
            <p className="mt-4 max-w-[48ch] text-lg text-pretty text-muted-foreground">
              Not a pile of dependencies to assemble. The pieces every product needs are wired to
              each other and covered by tests.
            </p>
          </div>
          <dl className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {CAPABILITIES.map((capability) => {
              const Icon = capability.icon;
              return (
                <div key={capability.title}>
                  <Icon aria-hidden="true" className="size-6 shrink-0 text-primary" />
                  <dt className="mt-5 text-base font-medium">{capability.title}</dt>
                  <dd className="mt-2 text-base text-pretty text-muted-foreground sm:text-sm">
                    {capability.description}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <section className="border-t border-border py-20 md:py-24" id="structure">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2 md:px-8">
          <div>
            <p className="font-mono text-sm tracking-wide text-primary uppercase">Structure</p>
            <h2 className="mt-4 max-w-[35ch] text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              Apps and packages, kept apart on purpose.
            </h2>
            <p className="mt-4 max-w-[48ch] text-lg text-pretty text-muted-foreground">
              Every workspace owns one job and states what it needs from the others, so a change
              stays where you made it.
            </p>
          </div>
          <dl className="divide-y divide-border">
            {WORKSPACES.map((workspace) => (
              <div
                className="grid gap-1 py-5 first:pt-0 last:pb-0 sm:grid-cols-[9rem_1fr] sm:gap-6"
                key={workspace.name}
              >
                <dt className="font-mono text-base font-medium sm:text-sm">{workspace.name}</dt>
                <dd className="text-base text-pretty text-muted-foreground sm:text-sm">
                  {workspace.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-20 md:py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 md:px-8">
          <div>
            <h2 className="max-w-[35ch] text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              Fork it and start on the product.
            </h2>
            <p className="mt-4 max-w-[48ch] text-lg text-pretty text-muted-foreground">
              Keep the boundaries, replace the domain, and let the checks tell you when the
              foundation drifts.
            </p>
          </div>
          <a
            className={buttonVariants({ size: "lg", variant: "outline" })}
            href={webAppUrl("/register")}
          >
            Open the app
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
};

export { metadata };

export default Page;
