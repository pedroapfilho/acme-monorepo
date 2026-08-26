import { Skeleton } from "@repo/ui/components/skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SignOutButton } from "@/components/sign-out-button";
import { getSession } from "@/lib/auth-helpers";

export const metadata: Metadata = { title: "Dashboard" };

/** @public Next.js app-router reads the instant segment config via the module loader */
export const instant = true;

const DashboardContent = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back{session.user.name ? `, ${session.user.name}` : ""}
          </p>
        </div>
        <Link
          className="text-sm text-foreground underline underline-offset-4"
          href="/dashboard/settings"
        >
          Settings
        </Link>
      </header>

      <dl className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Email
          </dt>
          <dd className="text-sm text-foreground">{session.user.email}</dd>
        </div>
        {session.user.name && (
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Name
            </dt>
            <dd className="text-sm text-foreground">{session.user.name}</dd>
          </div>
        )}
      </dl>

      <SignOutButton />
    </>
  );
};

const DashboardSkeleton = () => (
  <div aria-hidden className="flex flex-col gap-8">
    <header className="flex flex-col gap-2">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-32" />
    </header>
    <dl className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-28" />
      </div>
    </dl>
  </div>
);

const Dashboard = () => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  </div>
);

export default Dashboard;
