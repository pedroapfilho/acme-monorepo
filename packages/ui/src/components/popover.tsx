"use client";

import {
  Anchor as PopoverPrimitiveAnchor,
  Content as PopoverPrimitiveContent,
  Portal as PopoverPrimitivePortal,
  Root as PopoverPrimitiveRoot,
  Trigger as PopoverPrimitiveTrigger,
} from "@radix-ui/react-popover";
import { type ComponentProps } from "react";

import { cn } from "../lib/utils";

function Popover({ ...props }: ComponentProps<typeof PopoverPrimitiveRoot>) {
  return <PopoverPrimitiveRoot data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: ComponentProps<typeof PopoverPrimitiveTrigger>) {
  return <PopoverPrimitiveTrigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  align = "center",
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitiveContent>) {
  return (
    <PopoverPrimitivePortal>
      <PopoverPrimitiveContent
        align={align}
        className={cn(
          "ui:bg-popover ui:text-popover-foreground ui:data-[state=open]:animate-in ui:data-[state=closed]:animate-out ui:data-[state=closed]:fade-out-0 ui:data-[state=open]:fade-in-0 ui:data-[state=closed]:zoom-out-95 ui:data-[state=open]:zoom-in-95 ui:data-[side=bottom]:slide-in-from-top-2 ui:data-[side=left]:slide-in-from-right-2 ui:data-[side=right]:slide-in-from-left-2 ui:data-[side=top]:slide-in-from-bottom-2 ui:z-50 ui:w-72 ui:origin-(--radix-popover-content-transform-origin) ui:rounded-md ui:border ui:p-4 ui:shadow-md ui:outline-hidden",
          className,
        )}
        data-slot="popover-content"
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitivePortal>
  );
}

function PopoverAnchor({ ...props }: ComponentProps<typeof PopoverPrimitiveAnchor>) {
  return <PopoverPrimitiveAnchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
