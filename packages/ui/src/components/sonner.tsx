import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

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

export { toast, Toaster };
