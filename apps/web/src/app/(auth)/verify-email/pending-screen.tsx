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
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";

import { consumeCredentials } from "./credentials-store";

const POLL_INTERVAL_MS = 5000;
const RESEND_COOLDOWN_SECONDS = 60;

type Props = {
  token: string | null;
};

type Credentials = {
  email: string;
  password: string;
};

const PendingScreen = ({ token }: Props) => {
  const router = useRouter();
  // useMemo so strict-mode double-mount doesn't burn the one-shot token.
  const initialCredentials = useMemo<Credentials | null>(
    () => (token ? consumeCredentials(token) : null),
    [token],
  );
  const [credentials] = useState<Credentials | null>(initialCredentials);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Poll signIn.email until verification succeeds; pause while the tab is hidden.
  useEffect(() => {
    if (!credentials) {
      return;
    }
    const { email, password } = credentials;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) {
        return;
      }
      if (document.visibilityState !== "visible") {
        timer = setTimeout(() => {
          void tick();
        }, POLL_INTERVAL_MS);
        return;
      }
      const result = await authClient.signIn.email({ email, password });
      if (cancelled || !isMountedRef.current) {
        return;
      }
      if (!result.error && result.data) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      timer = setTimeout(() => {
        void tick();
      }, POLL_INTERVAL_MS);
    };

    const onVisibility = () => {
      if (cancelled || document.visibilityState !== "visible") {
        return;
      }
      void tick();
    };

    document.addEventListener("visibilitychange", onVisibility);
    void tick();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [credentials, router]);

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

  const onResend = useCallback(async () => {
    if (!credentials || cooldown > 0 || isResending) {
      return;
    }
    setIsResending(true);
    try {
      await authClient.sendVerificationEmail({
        callbackURL: "/verify-email/success",
        email: credentials.email,
      });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setIsResending(false);
    }
  }, [cooldown, credentials, isResending]);

  if (!credentials) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verifying your email</CardTitle>
          <CardDescription>
            Click the verification link from your inbox. Once you do, sign in to continue.
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
          <span className="font-medium text-foreground">{credentials.email}</span>. Click it to
          finish signing in — this page will continue automatically.
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
            void onResend();
          }}
          type="button"
          variant="outline"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
        </Button>
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
