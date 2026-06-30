import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SignOutButton } from "@/components/sign-out-button";
import { getSession } from "@/lib/auth-helpers";

export const metadata: Metadata = { title: "Dashboard" };

const DashboardContent = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back{session.user.name ? `, ${session.user.name}` : ""}
        </p>
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
      <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
    </header>
    <dl className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />
      </div>
    </dl>
  </div>
);

// Instant navigation: the static shell streams immediately as the fallback
// while the per-user, session-bound content renders on the server.
const Dashboard = () => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  </div>
);

export default Dashboard;
