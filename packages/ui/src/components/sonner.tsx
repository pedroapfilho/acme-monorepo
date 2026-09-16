"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme: activeTheme } = useTheme();
  const theme = activeTheme === "light" || activeTheme === "dark" ? activeTheme : "system";

  return (
    <Sonner
      className="group toaster"
      icons={{
        error: <OctagonXIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />,
        success: <CircleCheckIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
      }}
      theme={theme}
      toastOptions={{
        classNames: {
          toast: "rounded-2xl",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
