import Link from "next/link";

import { webAppUrl } from "@/lib/urls";

const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-(--breakpoint-xl) items-center justify-between px-6 py-4 md:px-8">
        <Link aria-label="Homepage" className="text-sm font-semibold tracking-tight" href="/">
          Acme
        </Link>
        <nav className="flex items-center gap-6 text-sm font-normal text-muted-foreground">
          <a className="transition-colors hover:text-foreground" href={webAppUrl("/login")}>
            Sign in
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
