import type { Metadata } from "next";
import "../pages.css";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { articles, readingMinutes } from "@/lib/content";
import { site } from "@/content/site";

const description = "Write-ups of real production problems: what broke, how it was found, and what changed. Client names are hidden.";

export const metadata: Metadata = {
  title: "Writing",
  description,
  alternates: { canonical: "/writing" },
  openGraph: { type: "website", siteName: site.name, url: "/writing", title: `Writing | ${site.name}`, description, images: ["/og.png"] },
};

export default function WritingIndex() {
  const posts = articles();
  return (
    <div className="page">
      <SiteHeader current="writing" />
      <main className="wrap">
        <header className="hero-block">
          <div className="label">Writing</div>
          <h1>Real problems, <i className="ac">solved in production.</i></h1>
          <p className="lede">{description} Each one was solved with an AI coding agent as a pair, and each says what was mine.</p>
        </header>
        <ul className="post-list">
          {posts.map((p) => (
            <li key={p.slug}>
              <a href={`/writing/${p.slug}`}>
                <h2>{p.meta.title}</h2>
                <p>{p.meta.description}</p>
                <span className="meta">{p.meta.topic} · {readingMinutes(p.body)} min read</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
