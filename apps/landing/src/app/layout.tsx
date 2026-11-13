import "@/styles/globals.css";

import { SkipLink } from "@repo/ui/compositions/skip-link";
import { MAIN_CONTENT_ID } from "@repo/ui/lib/main-content";
import { cn } from "@repo/ui/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist as geistFont, Geist_Mono as geistMonoFont } from "next/font/google";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  LONG_DESCRIPTION,
  SHORT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
} from "@/lib/site";

export { viewport } from "@repo/ui/lib/viewport";

const metadata = {
  description: LONG_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    description: SHORT_DESCRIPTION,
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    type: "website",
  },
  title: {
    default: `${SITE_NAME} | ${SHORT_DESCRIPTION}`,
    template: `%s · ${SITE_NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    description: SHORT_DESCRIPTION,
    site: `@${TWITTER_HANDLE}`,
    title: `${SITE_NAME} - ${SHORT_DESCRIPTION}`,
  },
} satisfies Metadata;

const geist = geistFont({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = geistMonoFont({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <body
        className={cn(
          "relative isolate flex min-h-dvh flex-col font-sans text-foreground antialiased",
          geist.variable,
          geistMono.variable,
        )}
      >
        <SkipLink />
        <Header />
        <main className="flex-1" id={MAIN_CONTENT_ID}>
          {children}
        </main>
        <Footer />

        <Analytics />
      </body>
    </html>
  );
};

export { metadata };

export default RootLayout;
