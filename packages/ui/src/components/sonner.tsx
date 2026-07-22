import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const toasterStyle: CSSProperties & Record<`--${string}`, string> = {
  "--border-radius": "var(--radius)",
  "--normal-bg": "var(--popover)",
  "--normal-border": "var(--border)",
  "--normal-text": "var(--popover-foreground)",
};

const Toaster = (props: ToasterProps) => (
  <Sonner className="toaster group" style={toasterStyle} {...props} />
);

export { toast } from "sonner";
export { Toaster };
