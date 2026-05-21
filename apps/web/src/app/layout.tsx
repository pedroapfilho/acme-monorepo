import "@/styles/globals.css";

import { Toaster } from "@repo/ui/components/sonner";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({
  display: "swap", // Improve font loading performance
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  authors: [{ name: "Acme Team" }],
  creator: "Acme",
  description:
    "A modern, secure authentication platform built with Better Auth and Next.js. Fast, reliable, and developer-friendly.",
  keywords: ["authentication", "security", "next.js", "better-auth", "login", "registration"],
  // Resolves Open Graph / Twitter card image URLs against this base.
  // Falls back to the canonical local web origin when WEB_APP_URL isn't set.
  metadataBase: new URL(process.env.WEB_APP_URL ?? "https://acme.web.localhost"),
  publisher: "Acme",
  title: {
    default: "Acme | Secure Authentication Platform",
    template: "%s | Acme",
  },

  // Open Graph
  openGraph: {
    description: "A modern, secure authentication platform built with Better Auth and Next.js.",
    images: [
      {
        alt: "Acme Authentication Platform",
        height: 630,
        url: "/og-image.png",
        width: 1200,
      },
    ],
    locale: "en_US",
    siteName: "Acme",
    title: "Acme - Secure Authentication Platform",
    type: "website",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    description: "A modern, secure authentication platform built with Better Auth and Next.js.",
    images: ["/twitter-image.png"],
    title: "Acme - Secure Authentication Platform",
  },

  // Robots
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },

  // Icons
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
  },

  // Manifest
  manifest: "/site.webmanifest",

  // Other
  category: "technology",
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
    <html className={inter.variable} lang="en">
      <head>
        {/* Additional meta tags */}
        <meta content="telephone=no" name="format-detection" />
        <meta content="#000000" name="msapplication-TileColor" />

        {/* Security headers (additional to Next.js config) */}
        <meta content="nosniff" httpEquiv="X-Content-Type-Options" />
        <meta content="DENY" httpEquiv="X-Frame-Options" />
        <meta content="1; mode=block" httpEquiv="X-XSS-Protection" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <a
          className="sr-only fixed top-2 left-2 z-50 rounded-md bg-background px-3 py-2 text-sm font-medium text-foreground ring-1 ring-ring focus:not-sr-only"
          href="#main-content"
        >
          Skip to content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
