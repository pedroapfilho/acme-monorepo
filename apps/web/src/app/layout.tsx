import "@/styles/globals.css";

import { displayName } from "@repo/identity";
import { canonicalUrl } from "@repo/portless-env/apps";
import { Toaster } from "@repo/ui/components/sonner";
import { SkipLink } from "@repo/ui/compositions/skip-link";
import { ThemeProvider } from "@repo/ui/compositions/theme-provider";
import { MAIN_CONTENT_ID } from "@repo/ui/lib/main-content";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { webAppUrl } from "@/lib/env";
import { LONG_DESCRIPTION, SHORT_DESCRIPTION } from "@/lib/site";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

export { viewport } from "@repo/ui/lib/viewport";

const metadataBase = new URL(webAppUrl() ?? canonicalUrl("web"));

export const metadata: Metadata = {
  authors: [{ name: `${displayName} Team` }],
  category: "technology",
  creator: displayName,
  description: LONG_DESCRIPTION,
  keywords: ["authentication", "security", "next.js", "better-auth", "login", "registration"],
  metadataBase,
  openGraph: {
    description: LONG_DESCRIPTION,
    locale: "en_US",
    siteName: displayName,
    title: `${displayName} - ${SHORT_DESCRIPTION}`,
    type: "website",
  },
  publisher: displayName,
  robots: {
    follow: false,
    index: false,
  },
  title: {
    default: `${displayName} | ${SHORT_DESCRIPTION}`,
    template: `%s · ${displayName}`,
  },
  twitter: {
    card: "summary_large_image",
    description: LONG_DESCRIPTION,
    title: `${displayName} - ${SHORT_DESCRIPTION}`,
  },
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html className={inter.variable} lang="en-US" suppressHydrationWarning>
      <head>
        <meta content="telephone=no" name="format-detection" />
        <meta content="#000000" name="msapplication-TileColor" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SkipLink />
          <div id={MAIN_CONTENT_ID}>{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
