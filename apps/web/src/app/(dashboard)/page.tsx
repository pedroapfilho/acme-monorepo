import { authClient } from "@/lib/auth-client";
import { getSession } from "@/lib/auth-helpers";
import { Button } from "@repo/ui";
import { redirect } from "next/navigation";

async function SignOutButton() {
  async function handleSignOut() {
    "use server";

    await authClient.signOut();
    redirect("/login");
  }

  return (
    <form action={handleSignOut}>
      <Button type="submit" variant="outline">
        Sign Out
      </Button>
    </form>
  );
}

export default async function Dashboard() {
  const session = await getSession();

  // This shouldn't happen due to middleware, but as a safety check
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>

        <div className="mb-4 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 text-xl font-semibold">Welcome back!</h2>
          <p className="text-gray-600">
            You are logged in as: {session.user.email}
          </p>
          {session.user.name && (
            <p className="text-gray-600">Name: {session.user.name}</p>
          )}
          <p className="text-gray-600">User ID: {session.user.id}</p>
        </div>

        <SignOutButton />
      </div>
    </div>
  );
}
