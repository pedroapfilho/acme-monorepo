import Link from "next/link";

const YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-(--breakpoint-xl) flex-col gap-6 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p>&copy; {YEAR} Acme. All rights reserved.</p>
        <nav className="flex flex-wrap items-center gap-6 font-normal">
          <Link className="transition-colors hover:text-foreground" href="/privacy">
            Privacy
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/terms">
            Terms
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/contact">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
