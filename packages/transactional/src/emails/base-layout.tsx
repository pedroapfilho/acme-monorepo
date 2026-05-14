import * as React from "react";
import { Body, Container, Head, Html, Link, Preview, Section, Tailwind, Text } from "react-email";

import { AcmeLogo } from "../components/acme-logo";
import { tailwindConfig } from "../styles/theme";

type BaseLayoutProps = {
  children: React.ReactNode;
  footerText?: string;
  preview: string;
  unsubscribeUrl?: string;
};

const BaseLayout = ({
  children,
  footerText = "You're receiving this email because you have an account with Acme.",
  preview,
  unsubscribeUrl,
}: BaseLayoutProps) => {
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
          <Container className="mx-auto w-full max-w-[600px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {/* Header */}
            <Section className="bg-primary px-6 py-8 text-center">
              <Link className="inline-block no-underline" href="https://acme.com">
                <AcmeLogo height={28} width={104} />
              </Link>
            </Section>

            {/* Content */}
            <Section className="px-6 py-8">
              <div className="break-words">{children}</div>
            </Section>

            {/* Footer */}
            <Section className="border-t border-border bg-muted px-6 py-8 text-center">
              <Text className="m-0 mb-4 text-sm text-muted-foreground">{footerText}</Text>

              <Text className="mb-4 text-sm text-muted-foreground">
                <Link
                  className="text-sm font-semibold text-foreground no-underline"
                  href="https://acme.com"
                >
                  Visit Acme
                </Link>
                {unsubscribeUrl && (
                  <>
                    <span className="px-2 text-sm text-border">·</span>
                    <Link
                      className="text-sm font-semibold text-muted-foreground no-underline"
                      href={unsubscribeUrl}
                    >
                      Unsubscribe
                    </Link>
                  </>
                )}
              </Text>

              <Text className="m-0 text-xs text-muted-foreground">
                © {currentYear} Acme. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export { BaseLayout };
