import Link from "next/link";

import { webAppUrl } from "@/lib/urls";

const COPYRIGHT_YEAR = 2026;

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-(--breakpoint-xl) gap-8 px-6 py-10 text-sm md:grid-cols-[1fr_auto] md:px-8">
        <div className="space-y-3">
          <Link
            className="inline-flex items-center gap-2 font-mono font-semibold text-foreground"
            href="/"
          >
            <span aria-hidden="true" className="size-2.5 bg-primary" />
            acme
          </Link>
          <p className="max-w-[44ch] text-muted-foreground">
            A production-ready Next.js baseline for teams that want product work to start on day
            one.
          </p>
          <p className="text-muted-foreground">
            &copy; {COPYRIGHT_YEAR} Acme. All rights reserved.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground">
          <a className="hover:text-foreground" href="#architecture">
            Architecture
          </a>
          <a className="hover:text-foreground" href="#standards">
            Standards
          </a>
          <a className="hover:text-foreground" href={webAppUrl("/login")}>
            Sign in
          </a>
          <a className="hover:text-foreground" href={webAppUrl("/register")}>
            Open the app
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
