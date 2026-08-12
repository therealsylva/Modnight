import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";
import NavigationRail from "@/components/NavigationRail";
import CommandCenter from "@/components/CommandCenter";
import CartPanel from "@/components/CartPanel";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ModNight - Free Plugins, Mods & PC Tools",
  description: "Download free plugins, mods, and standalone PC utilities. Gaming tools, system utilities, productivity add-ons — completely free, no account needed.",
  keywords: ["free plugins", "free mods", "PC tools", "PC utilities", "gaming mods", "productivity plugins", "free add-ons"],
  authors: [{ name: "ModNight" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ModNight - Free Plugins, Mods & PC Tools",
    description: "Download free plugins, mods, and standalone PC utilities. Gaming tools, system utilities, productivity add-ons — completely free, no account needed.",
    type: "website",
    url: "https://modnight.com",
    siteName: "ModNight",
    images: [
      {
        url: "https://modnight.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "ModNight - Free Plugins, Mods & PC Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ModNight - Free Plugins, Mods & PC Tools",
    description: "Download free plugins, mods, and standalone PC utilities — completely free, no account needed.",
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
        className={`${jakartaSans.variable} ${jetbrainsMono.variable} antialiased dark bg-background text-foreground`}
      >
        <Providers>
          <NavigationRail />
          <CommandCenter />
          <div className="min-h-screen bg-background flex flex-col">
            {children}
            <Footer />
          </div>
          <CartPanel />
        </Providers>
      </body>
    </html>
  );
}
