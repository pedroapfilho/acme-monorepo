import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "ui:fixed ui:top-0 ui:z-[100] ui:flex ui:max-h-screen ui:w-full ui:flex-col-reverse ui:p-4 ui:sm:top-auto ui:sm:right-0 ui:sm:bottom-0 ui:sm:flex-col ui:md:max-w-[420px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = cva(
  "ui:group ui:data-[state=open]:animate-in ui:data-[state=closed]:animate-out ui:data-[swipe=end]:animate-out ui:data-[state=closed]:fade-out-80 ui:data-[state=closed]:slide-out-to-right-full ui:data-[state=open]:slide-in-from-top-full ui:data-[state=open]:sm:slide-in-from-bottom-full ui:pointer-events-auto ui:relative ui:flex ui:w-full ui:items-center ui:justify-between ui:space-x-4 ui:overflow-hidden ui:rounded-md ui:border ui:p-6 ui:pr-8 ui:shadow-lg ui:transition-all ui:data-[swipe=cancel]:translate-x-0 ui:data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] ui:data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] ui:data-[swipe=move]:transition-none",
  {
    variants: {
      variant: {
        default: "ui:bg-background ui:text-foreground ui:border",
        destructive:
          "destructive ui:border-destructive ui:bg-destructive ui:text-destructive-foreground",
        success:
          "ui:border-green-500 ui:bg-green-50 ui:text-green-900 ui:dark:border-green-400 ui:dark:bg-green-900/20 ui:dark:text-green-100",
        warning:
          "ui:border-orange-500 ui:bg-orange-50 ui:text-orange-900 ui:dark:border-orange-400 ui:dark:bg-orange-900/20 ui:dark:text-orange-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "ui:ring-offset-background ui:hover:bg-secondary ui:focus:ring-ring ui:group-[.destructive]:border-muted/40 ui:group-[.destructive]:hover:border-destructive/30 ui:group-[.destructive]:hover:bg-destructive ui:group-[.destructive]:hover:text-destructive-foreground ui:group-[.destructive]:focus:ring-destructive ui:inline-flex ui:h-8 ui:shrink-0 ui:items-center ui:justify-center ui:rounded-md ui:border ui:bg-transparent ui:px-3 ui:text-sm ui:font-medium ui:transition-colors ui:focus:ring-2 ui:focus:ring-offset-2 ui:focus:outline-none ui:disabled:pointer-events-none ui:disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "ui:text-foreground/50 ui:hover:text-foreground ui:absolute ui:top-2 ui:right-2 ui:rounded-md ui:p-1 ui:opacity-0 ui:transition-opacity ui:group-hover:opacity-100 ui:group-[.destructive]:text-red-300 ui:group-[.destructive]:hover:text-red-50 ui:focus:opacity-100 ui:focus:ring-2 ui:focus:outline-none ui:group-[.destructive]:focus:ring-red-400 ui:group-[.destructive]:focus:ring-offset-red-600",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="ui:h-4 ui:w-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("ui:text-sm ui:font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("ui:text-sm ui:opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
