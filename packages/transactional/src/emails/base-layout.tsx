import { displayName, origins } from "@repo/identity";
import * as React from "react";
import { Body, Container, Head, Html, Link, Preview, Section, Tailwind, Text } from "react-email";

import { Logo } from "../components/logo";
import { tailwindConfig } from "../styles/theme";

type BaseLayoutProps = {
  children: React.ReactNode;
  preview: string;
};

const BaseLayout = ({ children, preview }: BaseLayoutProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        <Head>
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <meta name="x-apple-disable-message-reformatting" />
          <meta content="light" name="color-scheme" />
          <meta content="light" name="supported-color-schemes" />
        </Head>
        <Preview>{preview}</Preview>
        <Body className="m-0 bg-muted p-4 font-sans">
          <Container className="mx-auto w-full max-w-150 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <Section className="bg-primary px-6 py-8 text-center">
              <Link className="inline-block no-underline" href={origins.apex}>
                <Logo />
              </Link>
            </Section>

            <Section className="px-6 py-8">
              <div className="break-words">{children}</div>
            </Section>

            <Section className="border-t border-border bg-muted px-6 py-8 text-center">
              <Text className="m-0 mb-4 text-sm text-muted-foreground">
                {`You're receiving this email because you have an account with ${displayName}.`}
              </Text>

              <Text className="mb-4 text-sm text-muted-foreground">
                <Link
                  className="text-sm font-semibold text-foreground no-underline"
                  href={origins.apex}
                >
                  {`Visit ${displayName}`}
                </Link>
              </Text>

              <Text className="m-0 text-xs text-muted-foreground">
                © {currentYear}
                {` ${displayName}. All rights reserved.`}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export { BaseLayout };
