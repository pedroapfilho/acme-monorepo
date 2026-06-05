"use client";

import { Button, buttonVariants } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import Link from "next/link";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

const RESEND_COOLDOWN_SECONDS = 60;

type Props = {
  email: string | null;
};

const PendingScreen = ({ email }: Props) => {
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const id = setTimeout(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => {
      clearTimeout(id);
    };
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0 || isResending) {
      return;
    }
    setIsResending(true);
    try {
      await authClient.sendVerificationEmail({
        callbackURL: "/verify-email/success",
        email,
      });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Check your inbox</CardTitle>
          <CardDescription>
            Click the verification link we sent to finish signing up, then sign in below.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Link className={buttonVariants({ className: "w-full" })} href="/login">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Check your inbox</CardTitle>
        <CardDescription>
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Click it to verify, then
          sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        Didn&apos;t get it? Check spam, or resend below.
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          disabled={cooldown > 0 || isResending}
          onClick={() => {
            void handleResend();
          }}
          type="button"
          variant="outline"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
        </Button>
        <Link className={buttonVariants({ className: "w-full" })} href="/login">
          Sign in
        </Link>
        <Link
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          href="/register"
        >
          Use a different email
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PendingScreen;
