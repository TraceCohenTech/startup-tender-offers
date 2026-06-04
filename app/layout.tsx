import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const BASE = "https://startup-tender-offers.vercel.app";
const TITLE = "Startup Tender Offers & Secondary Share Sales — 2022–2026";
const DESC =
  "Every known private market liquidity event for high-profile startups. 63 events across 31 companies — enriched with valuations, buyers, share prices & deal mechanics.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  metadataBase: new URL(BASE),
  openGraph: {
    title: TITLE,
    description: DESC,
    url: BASE,
    siteName: "ValueAdd VC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    creator: "@Trace_Cohen",
    site: "@Trace_Cohen",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
