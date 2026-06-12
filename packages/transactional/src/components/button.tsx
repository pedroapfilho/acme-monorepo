import { Button as EmailButton } from "react-email";

type ButtonProps = {
  children: React.ReactNode;
  fullWidth?: boolean;
  href: string;
  variant?: "primary" | "outline";
};

const BASE_CLASSES =
  "box-border rounded-lg px-5 py-3 text-center text-base font-semibold no-underline break-words whitespace-normal";

const VARIANT_CLASSES = {
  outline: "border border-border bg-card text-foreground",
  primary: "bg-primary text-primary-foreground",
};

const Button = ({ children, fullWidth = false, href, variant = "primary" }: ButtonProps) => {
  const widthClass = fullWidth ? "block w-full max-w-full" : "inline-block";

  return (
    <EmailButton
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${widthClass}`}
      href={href}
    >
      {children}
    </EmailButton>
  );
};

export { Button };
