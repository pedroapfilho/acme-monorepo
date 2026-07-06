import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => (
  <Sonner
    className="toaster group"
    style={
      {
        "--border-radius": "var(--radius)",
        "--normal-bg": "var(--popover)",
        "--normal-border": "var(--border)",
        "--normal-text": "var(--popover-foreground)",
      } as React.CSSProperties
    }
    {...props}
  />
);

export { toast } from "sonner";
export { Toaster };
