import { Section, Text } from "react-email";

type CardProps = {
  children: React.ReactNode;
  title: string;
};

const Card = ({ children, title }: CardProps) => (
  <Section className="rounded-lg border border-l-4 border-border border-l-primary bg-card p-5 break-words">
    <Text className="m-0 mb-2 text-base font-semibold break-words text-foreground">{title}</Text>
    <div className="break-words">{children}</div>
  </Section>
);

export { Card };
