import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

const Skeleton = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-muted", className)}
      data-slot="skeleton"
      {...props}
    />
  );
};

export { Skeleton };
