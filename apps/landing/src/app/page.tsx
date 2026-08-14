import { buttonVariants } from "@repo/ui/components/button-variants";
import { ArrowRight, Check, GitBranch, Layers3, ShieldCheck, Workflow } from "lucide-react";
import type { Metadata } from "next";

import { webAppUrl } from "@/lib/urls";

const metadata: Metadata = {
  description:
    "A production-ready Next.js monorepo baseline with auth, data, UI, testing, and release standards already connected.",
  title: { absolute: "Acme: Start with the foundation already solved" },
};

const instant = true;

const STACK = ["Next.js 16", "Better Auth", "Prisma", "shadcn/ui", "Vitest", "Playwright"];

const STANDARDS = [
  {
    description:
      "Web, API, packages, and shared configuration stay separated without hiding the path between them.",
    icon: Layers3,
    title: "A monorepo with boundaries",
  },
  {
    description:
      "Authentication, email verification, database access, and observability arrive as one working flow.",
    icon: Workflow,
    title: "End-to-end foundations",
  },
  {
    description:
      "Strict TypeScript, linting, tests, and browser checks guard every branch before it becomes main.",
    icon: ShieldCheck,
    title: "Quality gates included",
  },
] as const;

const Page = () => {
  return (
    <div className="blueprint-grid overflow-hidden">
      <section className="border-b border-border/70">
        <div className="mx-auto grid max-w-(--breakpoint-xl) gap-14 px-6 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="font-mono text-sm font-medium text-primary">production baseline / v1</p>
            <h1 className="mt-5 max-w-[15ch] font-mono text-5xl font-semibold tracking-[-0.05em] text-balance md:text-7xl">
              Start with the foundation already solved.
            </h1>
            <p className="mt-6 max-w-[55ch] text-lg text-pretty text-muted-foreground md:text-xl">
              Acme connects the parts every serious Next.js product needs, so your first branch can
              ship a feature instead of rebuilding the platform.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <a className={buttonVariants({ size: "lg" })} href={webAppUrl("/register")}>
                Launch the starter
                <ArrowRight aria-hidden="true" />
              </a>
              <a className={buttonVariants({ size: "lg", variant: "ghost" })} href="#architecture">
                Inspect the architecture
              </a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Check aria-hidden="true" className="size-4 text-primary" />
              Auth, data, email, observability, and tests are wired together.
            </p>
          </div>

          <div className="relative border border-border bg-background shadow-[12px_12px_0_var(--muted)]">
            <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-3 font-mono text-xs">
              <span>acme.workspace</span>
              <span className="text-muted-foreground">ready</span>
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-2">
              <div className="bg-background p-5">
                <p className="font-mono text-xs text-muted-foreground">apps/</p>
                <p className="mt-3 font-mono text-lg font-semibold">web · api · landing</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Deployable surfaces with shared contracts.
                </p>
              </div>
              <div className="bg-background p-5">
                <p className="font-mono text-xs text-muted-foreground">packages/</p>
                <p className="mt-3 font-mono text-lg font-semibold">auth · db · ui</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Deep modules with narrow interfaces.
                </p>
              </div>
              <div className="bg-background p-5 sm:col-span-2">
                <p className="font-mono text-xs text-muted-foreground">pipeline</p>
                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
                  {["typecheck", "lint", "test", "build"].map((step, index) => (
                    <div className="flex items-center gap-2" key={step}>
                      {index > 0 && (
                        <span aria-hidden="true" className="text-muted-foreground">
                          →
                        </span>
                      )}
                      <span className="border border-border bg-muted/60 px-3 py-2">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border p-4">
              {STACK.map((item) => (
                <span
                  className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-background" id="architecture">
        <div className="mx-auto max-w-(--breakpoint-xl) px-6 py-20 md:px-8 md:py-24">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <p className="font-mono text-sm text-primary">architecture</p>
              <h2 className="mt-3 max-w-[16ch] font-mono text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                Clear layers, visible contracts.
              </h2>
            </div>
            <p className="max-w-[60ch] text-lg text-pretty text-muted-foreground">
              Each layer has one job. Applications compose the product, packages own the hard parts,
              and the pipeline proves they still fit together.
            </p>
          </div>
          <dl className="mt-12 grid gap-px border border-border bg-border md:grid-cols-3">
            {STANDARDS.map((standard) => {
              const Icon = standard.icon;
              return (
                <div className="bg-background p-6 md:p-8" key={standard.title}>
                  <Icon aria-hidden="true" className="size-5 text-primary" />
                  <dt className="mt-8 font-mono text-lg font-semibold">{standard.title}</dt>
                  <dd className="mt-3 text-sm leading-6 text-muted-foreground">
                    {standard.description}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground" id="standards">
        <div className="mx-auto grid max-w-(--breakpoint-xl) gap-10 px-6 py-16 md:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <GitBranch aria-hidden="true" className="size-6" />
            <h2 className="mt-5 max-w-[22ch] font-mono text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              Fork a system that is ready to change.
            </h2>
            <p className="mt-4 max-w-[58ch] text-primary-foreground/75">
              Keep the proven boundaries, replace the product domain, and let the checks tell you
              when the foundation drifts.
            </p>
          </div>
          <a
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold underline underline-offset-4"
            href={webAppUrl("/register")}
          >
            Open the app
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
};

export { instant, metadata };

export default Page;
