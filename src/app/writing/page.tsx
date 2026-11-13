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
  // Structured data: a collection of the articles, by the same Person as the home page (@id).
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/writing#page`,
        url: `${site.url}/writing`,
        name: `Writing | ${site.name}`,
        description,
        inLanguage: "en",
        isPartOf: { "@id": `${site.url}/#website` },
        author: { "@id": `${site.url}/#person` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/writing/${p.slug}`, name: p.meta.title })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Writing", item: `${site.url}/writing` },
        ],
      },
    ],
  };
  return (
    <div className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
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
