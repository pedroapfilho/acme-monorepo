import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/sign-out-button";
import { getSession } from "@/lib/auth-helpers";

const Dashboard = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>

        <div className="mb-4 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 text-xl font-semibold">Welcome back!</h2>
          <p className="text-gray-600">You are logged in as: {session.user.email}</p>
          {session.user.name && <p className="text-gray-600">Name: {session.user.name}</p>}
          <p className="text-gray-600">User ID: {session.user.id}</p>
        </div>

        <SignOutButton />
      </div>
    </div>
  );
};

export default Dashboard;
