import { buttonVariants } from "@repo/ui/components/button-variants";
import { Menu } from "lucide-react";
import Link from "next/link";

import { webAppUrl } from "@/lib/urls";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-(--breakpoint-xl) items-center gap-6 px-6 md:px-8">
        <Link
          aria-label="Acme homepage"
          className="inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-tight"
          href="/"
        >
          <span aria-hidden="true" className="size-2.5 bg-primary" />
          acme
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 text-sm md:flex">
          <a
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            href="#architecture"
          >
            Architecture
          </a>
          <a
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            href="#standards"
          >
            Standards
          </a>
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <a className="transition-colors hover:text-foreground" href={webAppUrl("/login")}>
            Sign in
          </a>
          <a
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={webAppUrl("/register")}
          >
            Open the app
          </a>
        </div>
        <details className="group relative ml-auto md:hidden">
          <summary className="flex size-11 list-none items-center justify-center rounded-md border border-border text-foreground marker:content-none">
            <Menu aria-hidden="true" />
            <span className="sr-only">Open navigation</span>
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute top-13 right-0 grid min-w-52 gap-1 border border-border bg-background p-2 shadow-lg"
          >
            <a className="rounded-md px-3 py-2 text-sm hover:bg-muted" href="#architecture">
              Architecture
            </a>
            <a className="rounded-md px-3 py-2 text-sm hover:bg-muted" href="#standards">
              Standards
            </a>
            <a className="rounded-md px-3 py-2 text-sm hover:bg-muted" href={webAppUrl("/login")}>
              Sign in
            </a>
            <a
              className="rounded-md px-3 py-2 text-sm hover:bg-muted"
              href={webAppUrl("/register")}
            >
              Open the app
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
};

export default Header;
