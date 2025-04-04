import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bidhaus Quality Manager",
  description: "Detect and manage quality issues in product listings for improved marketplace performance",
  openGraph: {
    title: "Bidhaus Quality Manager",
    description: "Identify and resolve quality issues in product listings with automated detection tools",
    images: [
      {
        url: "https://cdn.prod.website-files.com/6729490eec7b4529805b89b0/67ef66189eafe28f858f6b7d_Open%20Graph%20Image%20Bidhaus.png",
        width: 1200,
        height: 630,
        alt: "Bidhaus Quality Manager",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bidhaus Quality Manager",
    description: "Streamline product listing quality with automated detection and review tools",
    images: ["https://cdn.prod.website-files.com/6729490eec7b4529805b89b0/67ef66189eafe28f858f6b7d_Open%20Graph%20Image%20Bidhaus.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <ThemeProvider defaultTheme="system" storageKey="bidhaus-theme">
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
