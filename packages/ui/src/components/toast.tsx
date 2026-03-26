"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { type ComponentProps, type ReactElement } from "react";

import { cn } from "../lib/utils";

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function ToastViewport({ className, ...props }: ComponentProps<"ol">) {
  return (
    <ol
      className={cn(
        "ui:fixed ui:top-0 ui:z-[100] ui:flex ui:max-h-screen ui:w-full ui:flex-col-reverse ui:p-4 ui:sm:top-auto ui:sm:right-0 ui:sm:bottom-0 ui:sm:flex-col ui:md:max-w-[420px]",
        className,
      )}
      tabIndex={-1}
      {...props}
    />
  );
}
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "ui:group ui:data-[state=open]:animate-in ui:data-[state=closed]:animate-out ui:data-[swipe=end]:animate-out ui:data-[state=closed]:fade-out-80 ui:data-[state=closed]:slide-out-to-right-full ui:data-[state=open]:slide-in-from-top-full ui:data-[state=open]:sm:slide-in-from-bottom-full ui:pointer-events-auto ui:relative ui:flex ui:w-full ui:items-center ui:justify-between ui:space-x-4 ui:overflow-hidden ui:rounded-md ui:border ui:p-6 ui:pr-8 ui:shadow-lg ui:transition-all ui:data-[swipe=cancel]:translate-x-0 ui:data-[swipe=move]:transition-none",
  {
    defaultVariants: {
      variant: "default",
    },
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
  },
);

const Toast = ({
  className,
  open,
  onOpenChange,
  variant,
  ...props
}: ComponentProps<"li"> &
  VariantProps<typeof toastVariants> & {
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
  }) => {
  return (
    <li
      className={cn(toastVariants({ variant }), className)}
      data-state={open ? "open" : "closed"}
      role="status"
      {...props}
    />
  );
};
Toast.displayName = "Toast";

const ToastAction = ({
  className,
  altText,
  ...props
}: ComponentProps<"button"> & { altText: string }) => {
  return (
    <button
      aria-label={altText}
      className={cn(
        "ui:ring-offset-background ui:hover:bg-secondary ui:focus:ring-ring ui:group-[.destructive]:border-muted/40 ui:group-[.destructive]:hover:border-destructive/30 ui:group-[.destructive]:hover:bg-destructive ui:group-[.destructive]:hover:text-destructive-foreground ui:group-[.destructive]:focus:ring-destructive ui:inline-flex ui:h-8 ui:shrink-0 ui:items-center ui:justify-center ui:rounded-md ui:border ui:bg-transparent ui:px-3 ui:text-sm ui:font-medium ui:transition-colors ui:focus:ring-2 ui:focus:ring-offset-2 ui:focus:outline-none ui:disabled:pointer-events-none ui:disabled:opacity-50",
        className,
      )}
      type="button"
      {...props}
    />
  );
};
ToastAction.displayName = "ToastAction";

const ToastClose = ({ className, ...props }: ComponentProps<"button">) => {
  return (
    <button
      className={cn(
        "ui:text-foreground/50 ui:hover:text-foreground ui:absolute ui:top-2 ui:right-2 ui:rounded-md ui:p-1 ui:opacity-0 ui:transition-opacity ui:group-hover:opacity-100 ui:group-[.destructive]:text-red-300 ui:group-[.destructive]:hover:text-red-50 ui:focus:opacity-100 ui:focus:ring-2 ui:focus:outline-none ui:group-[.destructive]:focus:ring-red-400 ui:group-[.destructive]:focus:ring-offset-red-600",
        className,
      )}
      data-toast-close=""
      type="button"
      {...props}
    >
      <X className="ui:h-4 ui:w-4" />
    </button>
  );
};
ToastClose.displayName = "ToastClose";

const ToastTitle = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cn("ui:text-sm ui:font-semibold", className)} {...props} />;
};
ToastTitle.displayName = "ToastTitle";

const ToastDescription = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cn("ui:text-sm ui:opacity-90", className)} {...props} />;
};
ToastDescription.displayName = "ToastDescription";

type ToastProps = ComponentProps<typeof Toast>;
type ToastActionElement = ReactElement<typeof ToastAction>;

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
