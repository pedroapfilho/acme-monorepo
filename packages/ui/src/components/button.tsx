import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  "ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive ui:inline-flex ui:shrink-0 ui:items-center ui:justify-center ui:gap-2 ui:rounded-md ui:text-sm ui:font-medium ui:whitespace-nowrap ui:transition-all ui:outline-none ui:focus-visible:ring-[3px] ui:disabled:pointer-events-none ui:disabled:opacity-50 ui:[&_svg]:pointer-events-none ui:[&_svg]:shrink-0 ui:[&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "ui:h-9 ui:px-4 ui:py-2 ui:has-[>svg]:px-3",
        icon: "ui:size-9",
        lg: "ui:h-10 ui:rounded-md ui:px-6 ui:has-[>svg]:px-4",
        sm: "ui:h-8 ui:gap-1.5 ui:rounded-md ui:px-3 ui:has-[>svg]:px-2.5",
      },
      variant: {
        default: "ui:bg-primary ui:text-primary-foreground ui:hover:bg-primary/90 ui:shadow-xs",
        destructive:
          "ui:bg-destructive ui:hover:bg-destructive/90 ui:focus-visible:ring-destructive/20 ui:dark:focus-visible:ring-destructive/40 ui:dark:bg-destructive/60 ui:text-white ui:shadow-xs",
        ghost: "ui:hover:bg-accent ui:hover:text-accent-foreground ui:dark:hover:bg-accent/50",
        link: "ui:text-primary ui:underline-offset-4 ui:hover:underline",
        outline:
          "ui:bg-background ui:hover:bg-accent ui:hover:text-accent-foreground ui:dark:bg-input/30 ui:dark:border-input ui:dark:hover:bg-input/50 ui:border ui:shadow-xs",
        secondary:
          "ui:bg-secondary ui:text-secondary-foreground ui:hover:bg-secondary/80 ui:shadow-xs",
      },
    },
  },
);

const Button = ({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot="button"
      {...props}
    />
  );
};

export { Button, buttonVariants };
