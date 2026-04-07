"use client";

import { Skeleton } from "boneyard-js/react";
import { ReactNode } from "react";

type BoneyardSkeletonProps = {
  children: ReactNode;
  fixture: ReactNode;
  loading: boolean;
  name: string;
};

const BoneyardSkeleton = ({ children, fixture, loading, name }: BoneyardSkeletonProps) => {
  return (
    <Skeleton animate="pulse" fixture={fixture} loading={loading} name={name}>
      {children}
    </Skeleton>
  );
};

export { BoneyardSkeleton };
