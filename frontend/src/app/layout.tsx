import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ModNight - Marketplace for Add-ons, Mods & Plugins",
  description: "Discover and install high-quality add-ons, styled mods, and app plugins for your favorite games and productivity tools.",
  keywords: ["mods", "plugins", "add-ons", "gaming", "productivity", "marketplace"],
  authors: [{ name: "ModNight" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ModNight - Add-ons, Mods & Plugins Marketplace",
    description: "Discover premium add-ons, mods, and plugins for your favorite applications",
    type: "website",
    url: "https://modnight.com",
    siteName: "ModNight",
    images: [
      {
        url: "https://modnight.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "ModNight - Plugins & Mods Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ModNight",
    description: "Add-ons, Mods & Plugins Marketplace",
    images: ["https://modnight.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark bg-background text-foreground`}
      >
        <Providers>
          <div className="min-h-screen bg-background flex flex-col">
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
