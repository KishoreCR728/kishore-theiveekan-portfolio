import type { Metadata } from "next";
import "./pages.css";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";

export const metadata: Metadata = { title: "Page not found", alternates: { canonical: null }, robots: { index: false } };

export default function NotFound() {
  return (
    <div className="page">
      <SiteHeader />
      <main id="main" className="wrap not-found">
        <p className="label">404</p>
        <h1>Not <i className="ac">here.</i></h1>
        <p className="lede">This page doesn&apos;t exist, or it moved. These will get you back on track:</p>
        <div className="not-found-actions">
          <a className="pill dark" href="/">Home</a>
          <a className="pill" href="/#work">Case studies</a>
          <a className="pill" href="/writing">Writing</a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
