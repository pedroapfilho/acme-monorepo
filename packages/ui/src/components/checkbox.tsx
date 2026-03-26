"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "../lib/utils";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "ui:peer ui:relative ui:flex ui:size-4 ui:shrink-0 ui:items-center ui:justify-center ui:rounded-[4px] ui:border ui:border-input ui:transition-colors ui:outline-none ui:group-has-disabled/field:opacity-50 ui:after:absolute ui:after:-inset-x-3 ui:after:-inset-y-2 ui:focus-visible:border-ring ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50 ui:disabled:cursor-not-allowed ui:disabled:opacity-50 ui:aria-invalid:border-destructive ui:aria-invalid:ring-3 ui:aria-invalid:ring-destructive/20 ui:aria-invalid:aria-checked:border-primary ui:dark:bg-input/30 ui:dark:aria-invalid:border-destructive/50 ui:dark:aria-invalid:ring-destructive/40 ui:data-checked:border-primary ui:data-checked:bg-primary ui:data-checked:text-primary-foreground ui:dark:data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="ui:grid ui:place-content-center ui:text-current ui:transition-none ui:[&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
