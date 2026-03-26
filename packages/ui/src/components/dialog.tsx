"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

import { Button } from "./button";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "ui:fixed ui:inset-0 ui:isolate ui:z-50 ui:bg-black/10 ui:duration-100 ui:supports-backdrop-filter:backdrop-blur-xs ui:data-open:animate-in ui:data-open:fade-in-0 ui:data-closed:animate-out ui:data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "ui:fixed ui:top-1/2 ui:left-1/2 ui:z-50 ui:grid ui:w-full ui:max-w-[calc(100%-2rem)] ui:-translate-x-1/2 ui:-translate-y-1/2 ui:gap-4 ui:rounded-xl ui:bg-popover ui:p-4 ui:text-sm ui:text-popover-foreground ui:ring-1 ui:ring-foreground/10 ui:duration-100 ui:outline-none ui:sm:max-w-sm ui:data-open:animate-in ui:data-open:fade-in-0 ui:data-open:zoom-in-95 ui:data-closed:animate-out ui:data-closed:fade-out-0 ui:data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button variant="ghost" className="ui:absolute ui:top-2 ui:right-2" size="icon-sm" />
            }
          >
            <XIcon />
            <span className="ui:sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("ui:flex ui:flex-col ui:gap-2", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "ui:-mx-4 ui:-mb-4 ui:flex ui:flex-col-reverse ui:gap-2 ui:rounded-b-xl ui:border-t ui:bg-muted/50 ui:p-4 ui:sm:flex-row ui:sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>Close</DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("ui: ui:text-base ui:leading-none ui:font-medium", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "ui:text-sm ui:text-muted-foreground ui:*:[a]:underline ui:*:[a]:underline-offset-3 ui:*:[a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
