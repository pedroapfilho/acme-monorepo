"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "../lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "ui:peer ui:group/switch ui:relative ui:inline-flex ui:shrink-0 ui:items-center ui:rounded-full ui:border ui:border-transparent ui:transition-all ui:outline-none ui:after:absolute ui:after:-inset-x-3 ui:after:-inset-y-2 ui:focus-visible:border-ring ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50 ui:aria-invalid:border-destructive ui:aria-invalid:ring-3 ui:aria-invalid:ring-destructive/20 ui:data-[size=default]:h-[18.4px] ui:data-[size=default]:w-[32px] ui:data-[size=sm]:h-[14px] ui:data-[size=sm]:w-[24px] ui:dark:aria-invalid:border-destructive/50 ui:dark:aria-invalid:ring-destructive/40 ui:data-checked:bg-primary ui:data-unchecked:bg-input ui:dark:data-unchecked:bg-input/80 ui:data-disabled:cursor-not-allowed ui:data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="ui:pointer-events-none ui:block ui:rounded-full ui:bg-background ui:ring-0 ui:transition-transform ui:group-data-[size=default]/switch:size-4 ui:group-data-[size=sm]/switch:size-3 ui:group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] ui:group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] ui:dark:data-checked:bg-primary-foreground ui:group-data-[size=default]/switch:data-unchecked:translate-x-0 ui:group-data-[size=sm]/switch:data-unchecked:translate-x-0 ui:dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
