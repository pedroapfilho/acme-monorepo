import { Button as EmailButton } from "react-email";

type ButtonProps = {
  children: React.ReactNode;
  fullWidth?: boolean;
  href: string;
  variant?: "primary" | "outline";
};

const Button = ({ children, fullWidth = false, href, variant = "primary" }: ButtonProps) => {
  const baseClasses =
    "box-border rounded-lg px-5 py-3 text-center text-base font-semibold no-underline break-words whitespace-normal";

  const variantClasses = {
    outline: "border border-border bg-card text-foreground",
    primary: "bg-primary text-primary-foreground",
  };

  const widthClass = fullWidth ? "block w-full max-w-full" : "inline-block";

  return (
    <EmailButton className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`} href={href}>
      {children}
    </EmailButton>
  );
};

export { Button };
