import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/content/site";

const sans = localFont({
  src: "../fonts/dm-sans-latin-opsz-normal.woff2",
  weight: "100 1000",
  variable: "--font-sans",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});
const serif = localFont({
  src: [{ path: "../fonts/instrument-serif-latin-400-italic.woff2", style: "italic" }],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: site.name, title: site.title, description: site.description, images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <noscript><style>{`[data-loader]{display:none!important}[data-reveal] [data-w],[data-fade],[data-float]{opacity:1!important;transform:none!important}`}</style></noscript>
        {children}
      </body>
    </html>
  );
}
