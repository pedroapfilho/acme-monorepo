"use client";

import {
  Indicator as ProgressPrimitiveIndicator,
  Root as ProgressPrimitiveRoot,
} from "@radix-ui/react-progress";
import { type ComponentProps } from "react";

import { cn } from "../lib/utils";

function Progress({ className, value, ...props }: ComponentProps<typeof ProgressPrimitiveRoot>) {
  return (
    <ProgressPrimitiveRoot
      className={cn(
        "ui:bg-primary/20 ui:relative ui:h-2 ui:w-full ui:overflow-hidden ui:rounded-full",
        className,
      )}
      data-slot="progress"
      {...props}
    >
      <ProgressPrimitiveIndicator
        className="ui:bg-primary ui:h-full ui:w-full ui:flex-1 ui:transition-all"
        data-slot="progress-indicator"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitiveRoot>
  );
}

export { Progress };
