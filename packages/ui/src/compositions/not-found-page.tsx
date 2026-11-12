import Link from "next/link";

import { buttonVariants } from "../components/button";
import { cn } from "../lib/utils";

const NotFoundPage = ({ className }: { className?: string }) => (
  <section className={cn("flex flex-col items-center gap-6 px-6 text-center", className)}>
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p aria-hidden="true" className="text-8xl font-bold tracking-tight text-foreground">
        404
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
    </div>
    <Link className={buttonVariants()} href="/">
      Go home
    </Link>
  </section>
);

export { NotFoundPage };
