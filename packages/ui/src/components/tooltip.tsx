"use client";

import {
  Arrow as TooltipPrimitiveArrow,
  Content as TooltipPrimitiveContent,
  Portal as TooltipPrimitivePortal,
  Provider as TooltipPrimitiveProvider,
  Root as TooltipPrimitiveRoot,
  Trigger as TooltipPrimitiveTrigger,
} from "@radix-ui/react-tooltip";
import { type ComponentProps } from "react";

import { cn } from "../lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: ComponentProps<typeof TooltipPrimitiveProvider>) {
  return (
    <TooltipPrimitiveProvider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: ComponentProps<typeof TooltipPrimitiveRoot>) {
  return (
    <TooltipProvider>
      <TooltipPrimitiveRoot data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: ComponentProps<typeof TooltipPrimitiveTrigger>) {
  return <TooltipPrimitiveTrigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  children,
  className,
  sideOffset = 0,
  ...props
}: ComponentProps<typeof TooltipPrimitiveContent>) {
  return (
    <TooltipPrimitivePortal>
      <TooltipPrimitiveContent
        className={cn(
          "ui:bg-primary ui:text-primary-foreground ui:animate-in ui:fade-in-0 ui:zoom-in-95 ui:data-[state=closed]:animate-out ui:data-[state=closed]:fade-out-0 ui:data-[state=closed]:zoom-out-95 ui:data-[side=bottom]:slide-in-from-top-2 ui:data-[side=left]:slide-in-from-right-2 ui:data-[side=right]:slide-in-from-left-2 ui:data-[side=top]:slide-in-from-bottom-2 ui:z-50 ui:w-fit ui:origin-(--radix-tooltip-content-transform-origin) ui:rounded-md ui:px-3 ui:py-1.5 ui:text-xs ui:text-balance",
          className,
        )}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        {...props}
      >
        {children}
        <TooltipPrimitiveArrow className="ui:bg-primary ui:fill-primary ui:z-50 ui:size-2.5 ui:translate-y-[calc(-50%_-_2px)] ui:rotate-45 ui:rounded-[2px]" />
      </TooltipPrimitiveContent>
    </TooltipPrimitivePortal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
