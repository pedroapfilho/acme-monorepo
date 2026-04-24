import { Button } from "@repo/ui/components/button";
import type { Metadata } from "next";
import Link from "next/link";

/** @public Next.js app-router reads metadata via the module loader */
export const metadata: Metadata = {
  title: "Page not found",
};

const NotFound = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
    <p className="text-8xl font-bold tracking-tight text-foreground">404</p>
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
      </p>
    </div>
    <Button render={<Link href="/" />}>Go home</Button>
  </main>
);

export default NotFound;
