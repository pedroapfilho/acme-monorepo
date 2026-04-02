"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const badgeVariants = cva(
  "ui:group/badge ui:inline-flex ui:h-5 ui:w-fit ui:shrink-0 ui:items-center ui:justify-center ui:gap-1 ui:overflow-hidden ui:rounded-4xl ui:border ui:border-transparent ui:px-2 ui:py-0.5 ui:text-xs ui:font-medium ui:whitespace-nowrap ui:transition-all ui:focus-visible:border-ring ui:focus-visible:ring-[3px] ui:focus-visible:ring-ring/50 ui:has-data-[icon=inline-end]:pr-1.5 ui:has-data-[icon=inline-start]:pl-1.5 ui:aria-invalid:border-destructive ui:aria-invalid:ring-destructive/20 ui:dark:aria-invalid:ring-destructive/40 ui:[&>svg]:pointer-events-none ui:[&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "ui:bg-primary ui:text-primary-foreground ui:[a]:hover:bg-primary/80",
        secondary: "ui:bg-secondary ui:text-secondary-foreground ui:[a]:hover:bg-secondary/80",
        destructive:
          "ui:bg-destructive/10 ui:text-destructive ui:focus-visible:ring-destructive/20 ui:dark:bg-destructive/20 ui:dark:focus-visible:ring-destructive/40 ui:[a]:hover:bg-destructive/20",
        outline:
          "ui:border-border ui:text-foreground ui:[a]:hover:bg-muted ui:[a]:hover:text-muted-foreground",
        ghost: "ui:hover:bg-muted ui:hover:text-muted-foreground ui:dark:hover:bg-muted/50",
        link: "ui:text-primary ui:underline-offset-4 ui:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
