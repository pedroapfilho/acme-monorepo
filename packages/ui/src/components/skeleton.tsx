import { cn } from "cn";

const Skeleton = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      data-slot="skeleton"
      {...props}
    />
  );
};

export { Skeleton };
