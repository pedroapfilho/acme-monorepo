"use client";

import Link from "next/link";
import { Suspense, use } from "react";
import type { ReactNode } from "react";

import { authPageHref } from "@/lib/redirect-validation";

type Props = {
  children: ReactNode;
  page: "/login" | "/register";
  searchParams: Promise<{ from?: string }>;
};

const className = "text-foreground underline underline-offset-4";

const ReturningLink = ({ children, page, searchParams }: Props) => {
  const { from } = use(searchParams);

  return (
    <Link className={className} href={authPageHref(page, from)}>
      {children}
    </Link>
  );
};

const AuthPageLink = (props: Props) => (
  <Suspense
    fallback={
      <Link className={className} href={props.page}>
        {props.children}
      </Link>
    }
  >
    <ReturningLink {...props} />
  </Suspense>
);

export { AuthPageLink };
