import "@/styles/globals.css";

import { Metadata } from "next";
import { Inter } from "next/font/google";

import { AnalyticsWrapper } from "@/components/analytics";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { cn } from "@/lib/utils";

const SITE_NAME = "Acme";

const SHORT_DESCRIPTION = "The one template to rule them all";

const LONG_DESCRIPTION = "Monorepo for base projects";

const TWITTER_HANDLE = "acme";

const SITE_URL = "https://www.acme-monorepo.com";

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
    default: `${SITE_NAME} - ${SHORT_DESCRIPTION}`,
    template: `%s - ${SITE_NAME}`,
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
  subsets: ["latin"],
  variable: "--font-sans",
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html className="scroll-smooth" data-mode="dark" lang="en-US">
      <body className={cn("relative min-h-screen font-sans antialiased", inter.variable)}>
        <>
          <Header />

          <main>{children}</main>

          <Footer />
        </>

        <AnalyticsWrapper />
      </body>
    </html>
  );
};

export { metadata };

export default RootLayout;
