import { VariantProps, cva } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "ui-inline-flex ui-items-center ui-justify-center ui-whitespace-nowrap ui-rounded-md ui-text-sm ui-font-semibold ui-transition-colors focus:ui-outline-none focus:ui-ring-2 focus:ui-ring-neutral-400 focus:ui-ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "ui-bg-neutral-600 ui-text-white hover:ui-bg-neutral-400 active:ui-bg-neutral-800 disabled:ui-bg-neutral-200 disabled:ui-text-neutral-800 disabled:ui-opacity-50",
        destructive:
          "ui-bg-red-600 ui-text-white hover:ui-bg-red-800 disabled:ui-opacity-50",
        outline:
          "border-neutral-800 ui-border ui-border-2 ui-bg-white ui-text-neutral-800 hover:ui-bg-neutral-50 active:ui-bg-neutral-100 disabled:ui-opacity-50",
        link: "ui-bg-transparent ui-text-neutral-800 ui-underline-offset-4 hover:ui-underline",
      },
      size: {
        default: "ui-h-10 ui-px-4",
        sm: "ui-h-8 ui-px-2",
        lg: "ui-text-md ui-h-14 ui-px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export type { ButtonProps };

export { Button, buttonVariants };
