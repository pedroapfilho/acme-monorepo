import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { isAPIError } from "better-auth/api";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getAuth } from "@/lib/auth";
import { getSession } from "@/lib/auth-helpers";

import { DeleteAccountForm } from "./delete-account-form";
import { EmailForm } from "./email-form";
import PasswordForm from "./password-form";
import { ProfileForm } from "./profile-form";
import {
  ReauthenticateButton,
  RevokeOtherSessionsButton,
  RevokeSessionButton,
} from "./session-actions";

export const metadata: Metadata = { title: "Settings" };

/** @public Next.js app-router reads the instant segment config via the module loader */
export const instant = true;

const sessionDateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const listSessions = async (headersList: Headers) => {
  try {
    return await getAuth().api.listSessions({ headers: headersList });
  } catch (error) {
    if (isAPIError(error) && error.body?.code === "SESSION_NOT_FRESH") {
      return null;
    }
    throw error;
  }
};

const SettingsContent = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const headersList = await headers();
  const auth = getAuth();
  const sessions = await listSessions(headersList);
  const sortedSessions = sessions?.toSorted(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const currentToken = session.session.token;
  const emailChangeEnabled = auth.options.user?.changeEmail?.enabled ?? false;

  return (
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, security, and sessions.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How your name appears across the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initialName={session.user.name} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>
            Signed in as <span className="font-medium">{session.user.email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailForm
            currentEmail={session.user.email}
            emailVerified={session.user.emailVerified}
            enabled={emailChangeEnabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Changing your password signs out your other sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sortedSessions ? (
            <>
              <ul className="flex flex-col divide-y divide-border">
                {sortedSessions.map((activeSession) => {
                  const isCurrent = activeSession.token === currentToken;
                  const ipAddress = activeSession.ipAddress ?? "";
                  return (
                    <li
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      key={activeSession.id}
                    >
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="truncate text-sm text-foreground">
                          {activeSession.userAgent ?? "Unknown device"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ipAddress === "" ? "" : `${ipAddress} · `}
                          Started {sessionDateFormat.format(new Date(activeSession.createdAt))}
                        </p>
                      </div>
                      {isCurrent ? (
                        <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          This device
                        </span>
                      ) : (
                        <RevokeSessionButton token={activeSession.token} />
                      )}
                    </li>
                  );
                })}
              </ul>
              {sortedSessions.length > 1 && <RevokeOtherSessionsButton />}
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Sign in again to view and manage active sessions.
              </p>
              <ReauthenticateButton />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Permanently removes your account and all sessions. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </>
  );
};

const SettingsSkeleton = () => (
  <div aria-hidden className="flex flex-col gap-8">
    <header className="flex flex-col gap-2">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-5 w-64" />
    </header>
    {[0, 1, 2].map((section) => (
      <div className="flex flex-col gap-4 rounded-xl border border-border p-6" key={section}>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-9 w-full" />
      </div>
    ))}
  </div>
);

const Settings = () => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
    <p className="text-sm">
      <Link className="text-foreground underline underline-offset-4" href="/dashboard">
        ← Back to dashboard
      </Link>
    </p>
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  </div>
);

export default Settings;
