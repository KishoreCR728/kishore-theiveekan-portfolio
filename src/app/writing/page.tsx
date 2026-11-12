import type { Metadata } from "next";
import "../pages.css";
import "../home.css";
import { CaseFile } from "@/components/home/Writing";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { articles, readingMinutes } from "@/lib/content";
import { site } from "@/content/site";

const description = "Production bugs from my work: what broke, how I found the cause, what I changed and what it achieved. Client names are hidden.";

export const metadata: Metadata = {
  title: "Writing",
  description,
  alternates: { canonical: "/writing" },
  openGraph: { type: "website", siteName: site.name, url: "/writing", title: `Writing | ${site.name}`, description, images: ["/og/writing.png"] },
  twitter: { card: "summary_large_image", title: `Writing | ${site.name}`, description, images: ["/og/writing.png"] },
};

export default function WritingIndex() {
  const posts = articles();
  return (
    <div className="page">
      <SiteHeader current="writing" />
      <main id="main" className="wrap">
        <header className="hero-block">
          <div className="label">Writing</div>
          <h1>Real bugs, <i className="ac">and how I handled them.</i></h1>
          <p className="lede">{description} Each was solved with an AI coding agent as a pair, and each says what was mine.</p>
        </header>
        <ul className="bug-grid writing-index">
          {posts.map((p) => (
            <li key={p.slug}>
              <a href={`/writing/${p.slug}`} className="bug-card">
                <span className="bug-topic">{p.meta.topic} · {readingMinutes(p.body)} min read</span>
                <h2>{p.meta.title}</h2>
                <CaseFile meta={p.meta} compact />
                <span className="bug-more">Read the full story <span aria-hidden="true">→</span></span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
