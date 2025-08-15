import { NextAuthProvider } from "@/app/providers";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Acme",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>{children} </NextAuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
