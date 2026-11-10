import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/dm-sans/opsz.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import "./hover.css";
import { site } from "@/content/site";

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
    <html lang="en">
      <body>
        <noscript><style>{`[data-loader]{display:none!important}[data-reveal] [data-w],[data-fade],[data-float]{opacity:1!important;transform:none!important}`}</style></noscript>
        {children}
      </body>
    </html>
  );
}
