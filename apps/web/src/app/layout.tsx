import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

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
  publisher: "Acme",
  title: {
    default: "Acme - Secure Authentication Platform",
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
    url: "https://acme.example.com",
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
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
