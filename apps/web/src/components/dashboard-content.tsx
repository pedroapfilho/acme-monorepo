"use client";

import { ReactNode } from "react";

import { BoneyardSkeleton } from "@/components/boneyard-skeleton";

type DashboardContentProps = {
  children: ReactNode;
};

const DashboardContent = ({ children }: DashboardContentProps) => {
  return (
    <BoneyardSkeleton
      fixture={
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 h-9 w-48 rounded bg-neutral-200" />
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-2 h-7 w-40 rounded bg-neutral-200" />
            <div className="mb-2 h-5 w-64 rounded bg-neutral-200" />
            <div className="mb-2 h-5 w-48 rounded bg-neutral-200" />
            <div className="h-5 w-56 rounded bg-neutral-200" />
          </div>
          <div className="mt-4 h-10 w-24 rounded bg-neutral-200" />
        </div>
      }
      loading={false}
      name="dashboard"
    >
      {children}
    </BoneyardSkeleton>
  );
};

export { DashboardContent };
