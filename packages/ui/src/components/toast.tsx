import {
  Action as ToastPrimitiveAction,
  Close as ToastPrimitiveClose,
  Description as ToastPrimitiveDescription,
  Provider as ToastPrimitiveProvider,
  Root as ToastPrimitiveRoot,
  Title as ToastPrimitiveTitle,
  Viewport as ToastPrimitiveViewport,
} from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactElement,
  forwardRef,
} from "react";

import { cn } from "../lib/utils";

const ToastProvider = ToastPrimitiveProvider;

const ToastViewport = forwardRef<
  ElementRef<typeof ToastPrimitiveViewport>,
  ComponentPropsWithoutRef<typeof ToastPrimitiveViewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitiveViewport
    className={cn(
      "ui:fixed ui:top-0 ui:z-[100] ui:flex ui:max-h-screen ui:w-full ui:flex-col-reverse ui:p-4 ui:sm:top-auto ui:sm:right-0 ui:sm:bottom-0 ui:sm:flex-col ui:md:max-w-[420px]",
      className,
    )}
    ref={ref}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitiveViewport.displayName;

const toastVariants = cva(
  "ui:group ui:data-[state=open]:animate-in ui:data-[state=closed]:animate-out ui:data-[swipe=end]:animate-out ui:data-[state=closed]:fade-out-80 ui:data-[state=closed]:slide-out-to-right-full ui:data-[state=open]:slide-in-from-top-full ui:data-[state=open]:sm:slide-in-from-bottom-full ui:pointer-events-auto ui:relative ui:flex ui:w-full ui:items-center ui:justify-between ui:space-x-4 ui:overflow-hidden ui:rounded-md ui:border ui:p-6 ui:pr-8 ui:shadow-lg ui:transition-all ui:data-[swipe=cancel]:translate-x-0 ui:data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] ui:data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] ui:data-[swipe=move]:transition-none",
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

const Toast = forwardRef<
  ElementRef<typeof ToastPrimitiveRoot>,
  ComponentPropsWithoutRef<typeof ToastPrimitiveRoot> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitiveRoot
      className={cn(toastVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitiveRoot.displayName;

const ToastAction = forwardRef<
  ElementRef<typeof ToastPrimitiveAction>,
  ComponentPropsWithoutRef<typeof ToastPrimitiveAction>
>(({ className, ...props }, ref) => (
  <ToastPrimitiveAction
    className={cn(
      "ui:ring-offset-background ui:hover:bg-secondary ui:focus:ring-ring ui:group-[.destructive]:border-muted/40 ui:group-[.destructive]:hover:border-destructive/30 ui:group-[.destructive]:hover:bg-destructive ui:group-[.destructive]:hover:text-destructive-foreground ui:group-[.destructive]:focus:ring-destructive ui:inline-flex ui:h-8 ui:shrink-0 ui:items-center ui:justify-center ui:rounded-md ui:border ui:bg-transparent ui:px-3 ui:text-sm ui:font-medium ui:transition-colors ui:focus:ring-2 ui:focus:ring-offset-2 ui:focus:outline-none ui:disabled:pointer-events-none ui:disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitiveAction.displayName;

const ToastClose = forwardRef<
  ElementRef<typeof ToastPrimitiveClose>,
  ComponentPropsWithoutRef<typeof ToastPrimitiveClose>
>(({ className, ...props }, ref) => (
  <ToastPrimitiveClose
    className={cn(
      "ui:text-foreground/50 ui:hover:text-foreground ui:absolute ui:top-2 ui:right-2 ui:rounded-md ui:p-1 ui:opacity-0 ui:transition-opacity ui:group-hover:opacity-100 ui:group-[.destructive]:text-red-300 ui:group-[.destructive]:hover:text-red-50 ui:focus:opacity-100 ui:focus:ring-2 ui:focus:outline-none ui:group-[.destructive]:focus:ring-red-400 ui:group-[.destructive]:focus:ring-offset-red-600",
      className,
    )}
    ref={ref}
    toast-close=""
    {...props}
  >
    <X className="ui:h-4 ui:w-4" />
  </ToastPrimitiveClose>
));
ToastClose.displayName = ToastPrimitiveClose.displayName;

const ToastTitle = forwardRef<
  ElementRef<typeof ToastPrimitiveTitle>,
  ComponentPropsWithoutRef<typeof ToastPrimitiveTitle>
>(({ className, ...props }, ref) => (
  <ToastPrimitiveTitle
    className={cn("ui:text-sm ui:font-semibold", className)}
    ref={ref}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitiveTitle.displayName;

const ToastDescription = forwardRef<
  ElementRef<typeof ToastPrimitiveDescription>,
  ComponentPropsWithoutRef<typeof ToastPrimitiveDescription>
>(({ className, ...props }, ref) => (
  <ToastPrimitiveDescription
    className={cn("ui:text-sm ui:opacity-90", className)}
    ref={ref}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitiveDescription.displayName;

type ToastProps = ComponentPropsWithoutRef<typeof Toast>;
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
