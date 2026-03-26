"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("ui:scroll-my-1 ui:p-1", className)}
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("ui:flex ui:flex-1 ui:text-left", className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "ui:flex ui:w-fit ui:items-center ui:justify-between ui:gap-1.5 ui:rounded-lg ui:border ui:border-input ui:bg-transparent ui:py-2 ui:pr-2 ui:pl-2.5 ui:text-sm ui:whitespace-nowrap ui:transition-colors ui:outline-none ui:select-none ui:focus-visible:border-ring ui:focus-visible:ring-3 ui:focus-visible:ring-ring/50 ui:disabled:cursor-not-allowed ui:disabled:opacity-50 ui:aria-invalid:border-destructive ui:aria-invalid:ring-3 ui:aria-invalid:ring-destructive/20 ui:data-placeholder:text-muted-foreground ui:data-[size=default]:h-8 ui:data-[size=sm]:h-7 ui:data-[size=sm]:rounded-[min(var(--radius-md),10px)] ui:*:data-[slot=select-value]:line-clamp-1 ui:*:data-[slot=select-value]:flex ui:*:data-[slot=select-value]:items-center ui:*:data-[slot=select-value]:gap-1.5 ui:dark:bg-input/30 ui:dark:hover:bg-input/50 ui:dark:aria-invalid:border-destructive/50 ui:dark:aria-invalid:ring-destructive/40 ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*=size-])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="ui:pointer-events-none ui:size-4 ui:text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="ui:isolate ui:z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "ui: ui: ui:relative ui:isolate ui:z-50 ui:max-h-(--available-height) ui:w-(--anchor-width) ui:min-w-36 ui:origin-(--transform-origin) ui:overflow-x-hidden ui:overflow-y-auto ui:rounded-lg ui:bg-popover ui:text-popover-foreground ui:shadow-md ui:ring-1 ui:ring-foreground/10 ui:duration-100 ui:data-[align-trigger=true]:animate-none ui:data-[side=bottom]:slide-in-from-top-2 ui:data-[side=inline-end]:slide-in-from-left-2 ui:data-[side=inline-start]:slide-in-from-right-2 ui:data-[side=left]:slide-in-from-right-2 ui:data-[side=right]:slide-in-from-left-2 ui:data-[side=top]:slide-in-from-bottom-2 ui:data-open:animate-in ui:data-open:fade-in-0 ui:data-open:zoom-in-95 ui:data-closed:animate-out ui:data-closed:fade-out-0 ui:data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("ui:px-1.5 ui:py-1 ui:text-xs ui:text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "ui:relative ui:flex ui:w-full ui:cursor-default ui:items-center ui:gap-1.5 ui:rounded-md ui:py-1 ui:pr-8 ui:pl-1.5 ui:text-sm ui:outline-hidden ui:select-none ui:focus:bg-accent ui:focus:text-accent-foreground ui:not-data-[variant=destructive]:focus:**:text-accent-foreground ui:data-disabled:pointer-events-none ui:data-disabled:opacity-50 ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*=size-])]:size-4 ui:*:[span]:last:flex ui:*:[span]:last:items-center ui:*:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="ui:flex ui:flex-1 ui:shrink-0 ui:gap-2 ui:whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="ui:pointer-events-none ui:absolute ui:right-2 ui:flex ui:size-4 ui:items-center ui:justify-center" />
        }
      >
        <CheckIcon className="ui:pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("ui:pointer-events-none ui:-mx-1 ui:my-1 ui:h-px ui:bg-border", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "ui:top-0 ui:z-10 ui:flex ui:w-full ui:cursor-default ui:items-center ui:justify-center ui:bg-popover ui:py-1 ui:[&_svg:not([class*=size-])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "ui:bottom-0 ui:z-10 ui:flex ui:w-full ui:cursor-default ui:items-center ui:justify-center ui:bg-popover ui:py-1 ui:[&_svg:not([class*=size-])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
