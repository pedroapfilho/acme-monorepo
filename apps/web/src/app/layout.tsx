import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // Improve font loading performance
});

export const metadata: Metadata = {
  title: {
    default: "Acme - Secure Authentication Platform",
    template: "%s | Acme",
  },
  description:
    "A modern, secure authentication platform built with Better Auth and Next.js. Fast, reliable, and developer-friendly.",
  keywords: ["authentication", "security", "next.js", "better-auth", "login", "registration"],
  authors: [{ name: "Acme Team" }],
  creator: "Acme",
  publisher: "Acme",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://acme.example.com",
    siteName: "Acme",
    title: "Acme - Secure Authentication Platform",
    description: "A modern, secure authentication platform built with Better Auth and Next.js.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Acme Authentication Platform",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Acme - Secure Authentication Platform",
    description: "A modern, secure authentication platform built with Better Auth and Next.js.",
    images: ["/twitter-image.png"],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // Manifest
  manifest: "/site.webmanifest",

  // Other
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Additional meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#000000" />

        {/* Security headers (additional to Next.js config) */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
