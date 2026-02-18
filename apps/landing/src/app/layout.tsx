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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - ${SHORT_DESCRIPTION}`,
    template: `%s - ${SITE_NAME}`,
  },
  description: LONG_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SHORT_DESCRIPTION,
    siteName: SITE_NAME,
    images: {
      url: "/og-image.jpg",
      alt: `${SITE_NAME} - ${SHORT_DESCRIPTION}`,
    },
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - ${SHORT_DESCRIPTION}`,
    description: SHORT_DESCRIPTION,
    site: `@${TWITTER_HANDLE}`,
    images: {
      url: "/og-image.jpg",
      alt: `${SITE_NAME} Logo`,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
} satisfies Metadata;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en-US" className="scroll-smooth" data-mode="dark">
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
