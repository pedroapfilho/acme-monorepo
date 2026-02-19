"use client";

import { Root as LabelPrimitiveRoot } from "@radix-ui/react-label";
import { type ComponentProps } from "react";

import { cn } from "../lib/utils";

function Label({ className, ...props }: ComponentProps<typeof LabelPrimitiveRoot>) {
  return (
    <LabelPrimitiveRoot
      className={cn(
        "ui:flex ui:items-center ui:gap-2 ui:text-sm ui:leading-none ui:font-medium ui:select-none ui:group-data-[disabled=true]:pointer-events-none ui:group-data-[disabled=true]:opacity-50 ui:peer-disabled:cursor-not-allowed ui:peer-disabled:opacity-50",
        className,
      )}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
