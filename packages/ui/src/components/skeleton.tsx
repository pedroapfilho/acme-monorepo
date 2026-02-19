import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "../lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  animation?: "pulse" | "wave" | "none";
  height?: string | number;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
};

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ animation = "pulse", className, height, style, variant = "text", width, ...props }, ref) => {
    const variantClasses = {
      circular: "ui:rounded-full",
      rectangular: "ui:rounded-none",
      rounded: "ui:rounded-lg",
      text: "ui:rounded-md",
    };

    const animationClasses = {
      none: "",
      pulse: "ui:animate-pulse",
      wave: "ui:animate-shimmer",
    };

    return (
      <div
        aria-hidden="true"
        className={cn(
          "ui:bg-muted",
          variantClasses[variant],
          animationClasses[animation],
          className,
        )}
        ref={ref}
        style={{
          height: height || "1.2em",
          width: width || "100%",
          ...style,
        }}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

// Skeleton container for grouping multiple skeletons
type SkeletonContainerProps = HTMLAttributes<HTMLDivElement> & {
  count?: number;
  spacing?: "sm" | "md" | "lg";
};

const SkeletonContainer = forwardRef<HTMLDivElement, SkeletonContainerProps>(
  ({ children, className, count = 1, spacing = "md", ...props }, ref) => {
    const spacingClasses = {
      lg: "ui:space-y-4",
      md: "ui:space-y-3",
      sm: "ui:space-y-2",
    };

    if (count > 1 && !children) {
      return (
        <div className={cn(spacingClasses[spacing], className)} ref={ref} {...props}>
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      );
    }

    return (
      <div className={cn(spacingClasses[spacing], className)} ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

SkeletonContainer.displayName = "SkeletonContainer";

// Pre-built skeleton patterns
const SkeletonCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("ui:space-y-3 ui:rounded-lg ui:border ui:p-4", className)}
        ref={ref}
        {...props}
      >
        <Skeleton className="ui:mb-4" height={200} variant="rectangular" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
      </div>
    );
  },
);

SkeletonCard.displayName = "SkeletonCard";

const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, size = 40, ...props }, ref) => {
    return (
      <Skeleton
        className={className}
        height={size}
        ref={ref}
        variant="circular"
        width={size}
        {...props}
      />
    );
  },
);

SkeletonAvatar.displayName = "SkeletonAvatar";

export { Skeleton, SkeletonContainer, SkeletonCard, SkeletonAvatar };
