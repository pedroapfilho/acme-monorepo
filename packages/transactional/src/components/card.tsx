import { Section, Text } from "react-email";

type CardProps = {
  accent?: boolean;
  children: React.ReactNode;
  title?: string;
};

const Card = ({ accent = false, children, title }: CardProps) => {
  const accentClasses = accent ? "border-l-4 border-l-primary" : "";

  return (
    <Section className={`rounded-lg border border-border bg-card p-5 break-words ${accentClasses}`}>
      {title && (
        <Text className="m-0 mb-2 text-base font-semibold break-words text-foreground">
          {title}
        </Text>
      )}
      <div className="break-words">{children}</div>
    </Section>
  );
};

export { Card };
