import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SplashProvider } from "@/components/layout/splash-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "iFranchise Portal",
  description: "Premium franchise onboarding for business owners and reviewers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-dvh bg-white font-sans antialiased">
        <SplashProvider>{children}</SplashProvider>
      </body>
    </html>
  );
}
