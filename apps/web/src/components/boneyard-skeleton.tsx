"use client";

import { Skeleton } from "boneyard-js/react";
import { ReactNode } from "react";

type BoneyardSkeletonProps = {
  children?: ReactNode;
  fixture?: ReactNode;
  name: string;
};

const BoneyardSkeleton = ({ children, fixture, name }: BoneyardSkeletonProps) => {
  return (
    <Skeleton animate="pulse" fixture={fixture} loading name={name}>
      {children}
    </Skeleton>
  );
};

export { BoneyardSkeleton };
