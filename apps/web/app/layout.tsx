import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/redux-toolkit/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AeroVideo - Premium Video Streaming",
    template: "%s | AeroVideo",
  },
  description:
    "AeroVideo is a premium video streaming platform for creators and viewers.",
  keywords: ["video", "streaming", "creators", "content", "AeroVideo"],
  authors: [{ name: "AeroVideo Team" }],
  creator: "AeroVideo",
  publisher: "AeroVideo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aerovideo.com",
    siteName: "AeroVideo",
    title: "AeroVideo - Premium Video Streaming",
    description: "Watch and share high-quality videos on AeroVideo.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AeroVideo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AeroVideo - Premium Video Streaming",
    description: "Watch and share high-quality videos on AeroVideo.",
    images: ["/og-image.png"],
    creator: "@aerovideo",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <NextTopLoader
            color="#3b82f6"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
          />
          {children}
          <Toaster position="bottom-left" richColors />
        </ReduxProvider>
      </body>
    </html>
  );
}
