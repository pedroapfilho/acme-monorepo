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
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]",
        className,
      )}
      tabIndex={-1}
      {...props}
    />
  );
}
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full data-[swipe=cancel]:translate-x-0 data-[swipe=end]:animate-out data-[swipe=move]:transition-none data-[state=open]:sm:slide-in-from-bottom-full",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive border-destructive bg-destructive text-destructive-foreground",
        success: "border-success/30 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/10 text-warning",
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
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
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
        "absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-destructive-foreground/70 hover:text-foreground group-[.destructive]:hover:text-destructive-foreground focus:opacity-100 focus:ring-2 focus:outline-none group-[.destructive]:focus:ring-destructive-foreground group-[.destructive]:focus:ring-offset-destructive",
        className,
      )}
      data-toast-close=""
      type="button"
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  );
};
ToastClose.displayName = "ToastClose";

const ToastTitle = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cn("text-sm font-semibold", className)} {...props} />;
};
ToastTitle.displayName = "ToastTitle";

const ToastDescription = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cn("text-sm opacity-90", className)} {...props} />;
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
