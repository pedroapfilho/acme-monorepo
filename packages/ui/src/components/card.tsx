import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

const Card = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "ui:bg-card ui:text-card-foreground ui:flex ui:flex-col ui:gap-6 ui:rounded-xl ui:border ui:py-6 ui:shadow-sm",
        className,
      )}
      data-slot="card"
      {...props}
    />
  );
};

const CardHeader = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "ui:@container/card-header ui:grid ui:auto-rows-min ui:grid-rows-[auto_auto] ui:items-start ui:gap-1.5 ui:px-6 ui:has-data-[slot=card-action]:grid-cols-[1fr_auto] ui:[.border-b]:pb-6",
        className,
      )}
      data-slot="card-header"
      {...props}
    />
  );
};

const CardTitle = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn("ui:leading-none ui:font-semibold", className)}
      data-slot="card-title"
      {...props}
    />
  );
};

const CardDescription = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn("ui:text-muted-foreground ui:text-sm", className)}
      data-slot="card-description"
      {...props}
    />
  );
};

const CardAction = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "ui:col-start-2 ui:row-span-2 ui:row-start-1 ui:self-start ui:justify-self-end",
        className,
      )}
      data-slot="card-action"
      {...props}
    />
  );
};

const CardContent = ({ className, ...props }: ComponentProps<"div">) => {
  return <div className={cn("ui:px-6", className)} data-slot="card-content" {...props} />;
};

const CardFooter = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn("ui:flex ui:items-center ui:px-6 ui:[.border-t]:pt-6", className)}
      data-slot="card-footer"
      {...props}
    />
  );
};

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
