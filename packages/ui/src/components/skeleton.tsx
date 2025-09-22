import { cn } from "../lib/utils";
import * as React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  animation?: "pulse" | "wave" | "none";
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = "text",
      animation = "pulse",
      width,
      height,
      style,
      ...props
    },
    ref,
  ) => {
    const variantClasses = {
      text: "rounded-md",
      circular: "rounded-full",
      rectangular: "rounded-none",
      rounded: "rounded-lg",
    };

    const animationClasses = {
      pulse: "animate-pulse",
      wave: "animate-shimmer",
      none: "",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-muted",
          variantClasses[variant],
          animationClasses[animation],
          className,
        )}
        style={{
          width: width || "100%",
          height: height || "1.2em",
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

// Skeleton container for grouping multiple skeletons
interface SkeletonContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  spacing?: "sm" | "md" | "lg";
}

const SkeletonContainer = React.forwardRef<
  HTMLDivElement,
  SkeletonContainerProps
>(({ children, className, count = 1, spacing = "md", ...props }, ref) => {
  const spacingClasses = {
    sm: "space-y-2",
    md: "space-y-3",
    lg: "space-y-4",
  };

  if (count > 1 && !children) {
    return (
      <div
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(spacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </div>
  );
});

SkeletonContainer.displayName = "SkeletonContainer";

// Pre-built skeleton patterns
const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("space-y-3 rounded-lg border p-4", className)}
      {...props}
    >
      <Skeleton variant="rectangular" height={200} className="mb-4" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
});

SkeletonCard.displayName = "SkeletonCard";

const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, size = 40, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        variant="circular"
        width={size}
        height={size}
        className={className}
        {...props}
      />
    );
  },
);

SkeletonAvatar.displayName = "SkeletonAvatar";

export { Skeleton, SkeletonContainer, SkeletonCard, SkeletonAvatar };
