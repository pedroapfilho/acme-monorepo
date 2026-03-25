"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "../lib/utils";

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="ui:isolate ui:z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "ui:z-50 ui:inline-flex ui:w-fit ui:max-w-xs ui:origin-(--transform-origin) ui:items-center ui:gap-1.5 ui:rounded-md ui:bg-foreground ui:px-3 ui:py-1.5 ui:text-xs ui:text-background ui:has-data-[slot=kbd]:pr-1.5 ui:data-[side=bottom]:slide-in-from-top-2 ui:data-[side=inline-end]:slide-in-from-left-2 ui:data-[side=inline-start]:slide-in-from-right-2 ui:data-[side=left]:slide-in-from-right-2 ui:data-[side=right]:slide-in-from-left-2 ui:data-[side=top]:slide-in-from-bottom-2 ui:**:data-[slot=kbd]:relative ui:**:data-[slot=kbd]:isolate ui:**:data-[slot=kbd]:z-50 ui:**:data-[slot=kbd]:rounded-sm ui:data-[state=delayed-open]:animate-in ui:data-[state=delayed-open]:fade-in-0 ui:data-[state=delayed-open]:zoom-in-95 ui:data-open:animate-in ui:data-open:fade-in-0 ui:data-open:zoom-in-95 ui:data-closed:animate-out ui:data-closed:fade-out-0 ui:data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="ui:z-50 ui:size-2.5 ui:translate-y-[calc(-50%-2px)] ui:rotate-45 ui:rounded-[2px] ui:bg-foreground ui:fill-foreground ui:data-[side=bottom]:top-1 ui:data-[side=inline-end]:top-1/2! ui:data-[side=inline-end]:-left-1 ui:data-[side=inline-end]:-translate-y-1/2 ui:data-[side=inline-start]:top-1/2! ui:data-[side=inline-start]:-right-1 ui:data-[side=inline-start]:-translate-y-1/2 ui:data-[side=left]:top-1/2! ui:data-[side=left]:-right-1 ui:data-[side=left]:-translate-y-1/2 ui:data-[side=right]:top-1/2! ui:data-[side=right]:-left-1 ui:data-[side=right]:-translate-y-1/2 ui:data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
