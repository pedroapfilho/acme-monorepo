"use client";

import {
  Fallback as AvatarPrimitiveFallback,
  Image as AvatarPrimitiveImage,
  Root as AvatarPrimitiveRoot,
} from "@radix-ui/react-avatar";
import { type ComponentProps } from "react";

import { cn } from "../lib/utils";

function Avatar({ className, ...props }: ComponentProps<typeof AvatarPrimitiveRoot>) {
  return (
    <AvatarPrimitiveRoot
      className={cn(
        "ui:relative ui:flex ui:size-8 ui:shrink-0 ui:overflow-hidden ui:rounded-full",
        className,
      )}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: ComponentProps<typeof AvatarPrimitiveImage>) {
  return (
    <AvatarPrimitiveImage
      className={cn("ui:aspect-square ui:size-full", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: ComponentProps<typeof AvatarPrimitiveFallback>) {
  return (
    <AvatarPrimitiveFallback
      className={cn(
        "ui:bg-muted ui:flex ui:size-full ui:items-center ui:justify-center ui:rounded-full",
        className,
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
