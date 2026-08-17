"use client";

import { buttonVariants } from "@repo/ui/components/button-variants";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { Logo } from "@/components/logo";
import { webAppUrl } from "@/lib/urls";

const Header = () => {
  const mobileNavigationRef = useRef<HTMLDetailsElement>(null);

  const handleSectionClick = () => {
    if (mobileNavigationRef.current) {
      mobileNavigationRef.current.open = false;
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-8 px-6 text-base md:px-8">
        <Link
          aria-label="Acme homepage"
          className="flex items-center gap-2 font-semibold tracking-tight"
          href="/"
        >
          <Logo className="size-5 shrink-0 text-primary" />
          Acme
        </Link>
        <nav
          aria-label="Main"
          className="flex items-center gap-6 text-sm text-muted-foreground max-md:hidden"
        >
          <Link className="hover:text-foreground" href="/#capabilities">
            Capabilities
          </Link>
          <Link className="hover:text-foreground" href="/#structure">
            Structure
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm max-md:hidden">
          <a className="text-muted-foreground hover:text-foreground" href={webAppUrl("/login")}>
            Sign in
          </a>
          <a
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={webAppUrl("/register")}
          >
            Get started
          </a>
        </div>
        <details className="relative ml-auto md:hidden" ref={mobileNavigationRef}>
          <summary className="relative flex size-11 list-none items-center justify-center rounded-lg border border-border marker:content-none">
            <Menu aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
            />
            <span className="sr-only">Open navigation</span>
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute top-full right-0 mt-2 grid min-w-56 gap-1 rounded-xl border border-border bg-background p-2 text-base shadow-lg"
          >
            <Link
              className="rounded-lg px-3 py-2 hover:bg-muted"
              href="/#capabilities"
              onClick={handleSectionClick}
            >
              Capabilities
            </Link>
            <Link
              className="rounded-lg px-3 py-2 hover:bg-muted"
              href="/#structure"
              onClick={handleSectionClick}
            >
              Structure
            </Link>
            <a className="rounded-lg px-3 py-2 hover:bg-muted" href={webAppUrl("/login")}>
              Sign in
            </a>
            <a className="rounded-lg px-3 py-2 hover:bg-muted" href={webAppUrl("/register")}>
              Get started
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
};

export default Header;
