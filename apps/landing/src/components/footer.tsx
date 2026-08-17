import { cacheLife } from "next/cache";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { webAppUrl } from "@/lib/urls";

// oxlint-disable-next-line eslint/require-await typescript/require-await -- Next.js cache components must be async even when they do not await.
const Footer = async () => {
  "use cache";

  cacheLife("days");

  const copyrightYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-12 md:grid-cols-[1fr_auto] md:px-8">
        <div>
          <Link
            aria-label="Acme homepage"
            className="flex w-fit items-center gap-2 text-base font-semibold tracking-tight"
            href="/"
          >
            <Logo className="size-5 shrink-0 text-primary" />
            Acme
          </Link>
          <p className="mt-5 max-w-[44ch] text-base text-pretty text-muted-foreground sm:text-sm">
            A production-ready Next.js baseline for teams that want product work to start on day
            one.
          </p>
          <p className="mt-3 text-base text-muted-foreground sm:text-sm">
            &copy; {copyrightYear} Acme. All rights reserved.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-12 gap-y-3 text-base font-normal text-muted-foreground sm:text-sm md:grid-cols-1"
        >
          <Link className="hover:text-foreground" href="/#capabilities">
            Capabilities
          </Link>
          <Link className="hover:text-foreground" href="/#structure">
            Structure
          </Link>
          <a className="hover:text-foreground" href={webAppUrl("/login")}>
            Sign in
          </a>
          <a className="hover:text-foreground" href={webAppUrl("/register")}>
            Get started
          </a>
        </nav>
      </div>
    </footer>
  );
};

export { Footer };
