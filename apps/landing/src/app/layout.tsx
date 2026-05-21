import "@/styles/globals.css";

import { cn } from "@repo/ui/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { AnalyticsWrapper } from "@/components/analytics";
import Footer from "@/components/footer";
import Header from "@/components/header";

const SITE_NAME = "Acme";

const SHORT_DESCRIPTION = "The one template to rule them all";

const LONG_DESCRIPTION = "Monorepo for base projects";

const TWITTER_HANDLE = "acme";

const SITE_URL = "https://www.acme-monorepo.com";

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

const metadata = {
  description: LONG_DESCRIPTION,
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/favicon.ico",
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    description: SHORT_DESCRIPTION,
    images: {
      alt: `${SITE_NAME} - ${SHORT_DESCRIPTION}`,
      url: "/og-image.jpg",
    },
    locale: "en-US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    type: "website",
  },
  title: {
    default: `${SITE_NAME} | ${SHORT_DESCRIPTION}`,
    template: `%s | ${SITE_NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    description: SHORT_DESCRIPTION,
    images: {
      alt: `${SITE_NAME} Logo`,
      url: "/og-image.jpg",
    },
    site: `@${TWITTER_HANDLE}`,
    title: `${SITE_NAME} - ${SHORT_DESCRIPTION}`,
  },
} satisfies Metadata;

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html className="scroll-smooth" lang="en-US" suppressHydrationWarning>
      <body
        className={cn(
          "relative flex min-h-dvh flex-col font-sans text-foreground antialiased",
          inter.variable,
        )}
      >
        <a
          className="sr-only fixed top-2 left-2 z-50 rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground ring-1 ring-ring focus:not-sr-only"
          href="#main-content"
        >
          Skip to content
        </a>
        <Header />
        <main className="flex-1" id="main-content">
          {children}
        </main>
        <Footer />

        <AnalyticsWrapper />
      </body>
    </html>
  );
};

export { metadata };

export default RootLayout;
