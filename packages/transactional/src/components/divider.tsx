import { Hr } from "react-email";

type DividerProps = {
  spacing?: "sm" | "md";
};

const SPACING_CLASSES = {
  md: "py-4",
  sm: "py-3",
};

const Divider = ({ spacing = "md" }: DividerProps) => {
  return (
    <div className={SPACING_CLASSES[spacing]}>
      <Hr className="m-0 border-border" />
    </div>
  );
};

export { Divider };
