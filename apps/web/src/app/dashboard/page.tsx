import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/sign-out-button";
import { getSession } from "@/lib/auth-helpers";

const Dashboard = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Signed in</p>
        <h1 className="max-w-[24ch] text-3xl font-semibold tracking-tight text-balance">
          Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}.
        </h1>
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
    </div>
  );
};

export default Dashboard;
