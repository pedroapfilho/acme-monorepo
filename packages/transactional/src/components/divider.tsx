import { Hr } from "react-email";

type DividerProps = {
  spacing?: "sm" | "md" | "lg";
};

const Divider = ({ spacing = "md" }: DividerProps) => {
  const spacingClasses = {
    lg: "py-5",
    md: "py-4",
    sm: "py-3",
  };

  return (
    <div className={spacingClasses[spacing]}>
      <Hr className="m-0 border-border" />
    </div>
  );
};

export { Divider };
