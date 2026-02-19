import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

const badgeVariants = cva(
  "ui:focus-visible:border-ring ui:focus-visible:ring-ring/50 ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:aria-invalid:border-destructive ui:inline-flex ui:w-fit ui:shrink-0 ui:items-center ui:justify-center ui:gap-1 ui:overflow-hidden ui:rounded-md ui:border ui:px-2 ui:py-0.5 ui:text-xs ui:font-medium ui:whitespace-nowrap ui:transition-[color,box-shadow] ui:focus-visible:ring-[3px] ui:[&>svg]:pointer-events-none ui:[&>svg]:size-3",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default:
          "ui:bg-primary ui:text-primary-foreground [a&]:ui:hover:bg-primary/90 ui:border-transparent",
        destructive:
          "ui:bg-destructive [a&]:ui:hover:bg-destructive/90 ui:focus-visible:ring-destructive/20 ui:dark:focus-visible:ring-destructive/40 ui:dark:bg-destructive/60 ui:border-transparent ui:text-white",
        outline: "ui:text-foreground [a&]:ui:hover:bg-accent [a&]:ui:hover:text-accent-foreground",
        secondary:
          "ui:bg-secondary ui:text-secondary-foreground [a&]:ui:hover:bg-secondary/90 ui:border-transparent",
      },
    },
  },
);

const Badge = ({
  asChild = false,
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp className={cn(badgeVariants({ variant }), className)} data-slot="badge" {...props} />
  );
};

export { Badge, badgeVariants };
