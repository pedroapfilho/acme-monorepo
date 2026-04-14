import type { HTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "../lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  animation?: "pulse" | "wave" | "none";
  height?: string | number;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
};

type SkeletonAvatarProps = SkeletonProps & {
  size?: number;
};

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ animation = "pulse", className, height, style, variant = "text", width, ...props }, ref) => {
    const variantClasses = {
      circular: "rounded-full",
      rectangular: "rounded-none",
      rounded: "rounded-lg",
      text: "rounded-md",
    };

    const animationClasses = {
      none: "",
      pulse: "animate-pulse",
      wave: "animate-shimmer",
    };

    return (
      <div
        aria-hidden="true"
        className={cn(
          "bg-muted",
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
      lg: "space-y-4",
      md: "space-y-3",
      sm: "space-y-2",
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
        className={cn("space-y-3 rounded-lg border p-4", className)}
        ref={ref}
        {...props}
      >
        <Skeleton className="mb-4" height={200} variant="rectangular" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
      </div>
    );
  },
);

SkeletonCard.displayName = "SkeletonCard";

const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
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
