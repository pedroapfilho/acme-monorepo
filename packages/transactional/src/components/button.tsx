import { Button as EmailButton } from "react-email";

type ButtonProps = {
  children: React.ReactNode;
  href: string;
};

const Button = ({ children, href }: ButtonProps) => (
  <EmailButton
    className="box-border block w-full max-w-full rounded-lg bg-primary px-5 py-3 text-center text-base font-semibold break-words whitespace-normal text-primary-foreground no-underline"
    href={href}
  >
    {children}
  </EmailButton>
);

export { Button };
