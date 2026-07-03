import type { Metadata } from "next";
import { Outfit, Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { PageTransitionProvider } from "@/components/providers/PageTransitionProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LinkBhejo — Instagram DM Automation",
    template: "%s | LinkBhejo",
  },
  description:
    "Automate Instagram DMs 24/7. Detect keywords in comments, replies, and live sessions — then send personalized messages automatically.",
  keywords: [
    "Instagram DM automation",
    "Instagram comment automation",
    "auto DM Instagram",
    "Instagram marketing automation",
    "Instagram bot",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://linkbhejo.com",
    title: "LinkBhejo — Instagram DM Automation",
    description: "Automate Instagram DMs 24/7. Grow your audience on autopilot.",
    siteName: "LinkBhejo",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkBhejo — Instagram DM Automation",
    description: "Automate Instagram DMs 24/7. Grow your audience on autopilot.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} ${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-sans`}>
        <ErrorBoundary>
          <Providers>
            <PageTransitionProvider>
              {children}
            </PageTransitionProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(222 47% 9%)",
                  border: "1px solid hsl(222 47% 15%)",
                  color: "hsl(210 40% 98%)",
                },
              }}
            />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
