import "@/styles/globals.css";

import { webAppUrl } from "@repo/auth/env-config";
import { canonicalUrl } from "@repo/portless-env/apps";
import { Toaster } from "@repo/ui/components/sonner";
import { ThemeProvider } from "@repo/ui/compositions/theme-provider";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { LONG_DESCRIPTION, SHORT_DESCRIPTION, SITE_NAME } from "@/lib/site";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

const metadataBase = new URL(webAppUrl() ?? canonicalUrl("web"));

export const metadata: Metadata = {
  authors: [{ name: `${SITE_NAME} Team` }],
  category: "technology",
  creator: SITE_NAME,
  description: LONG_DESCRIPTION,
  keywords: ["authentication", "security", "next.js", "better-auth", "login", "registration"],
  metadataBase,
  openGraph: {
    description: LONG_DESCRIPTION,
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ${SHORT_DESCRIPTION}`,
    type: "website",
  },
  publisher: SITE_NAME,
  robots: {
    follow: false,
    index: false,
  },
  title: {
    default: `${SITE_NAME} | ${SHORT_DESCRIPTION}`,
    template: `%s · ${SITE_NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    description: LONG_DESCRIPTION,
    title: `${SITE_NAME} - ${SHORT_DESCRIPTION}`,
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { color: "white", media: "(prefers-color-scheme: light)" },
    { color: "black", media: "(prefers-color-scheme: dark)" },
  ],
  userScalable: true,
  width: "device-width",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html className={inter.variable} lang="en" suppressHydrationWarning>
      <head>
        <meta content="telephone=no" name="format-detection" />
        <meta content="#000000" name="msapplication-TileColor" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <a
            className="sr-only fixed top-2 left-2 z-50 rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground ring-1 ring-ring focus:not-sr-only"
            href="#main-content"
          >
            Skip to content
          </a>
          <div id="main-content">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
