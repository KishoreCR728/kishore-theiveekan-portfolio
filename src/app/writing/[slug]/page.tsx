import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../pages.css";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { articles, formatMonth, readingMinutes } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = articles().find((x) => x.slug === slug);
  if (!a) return {};
  const title = `${a.meta.title} | ${site.name}`;
  return {
    title: a.meta.title,
    description: a.meta.description,
    alternates: { canonical: `/writing/${a.slug}` },
    openGraph: { type: "article", siteName: site.name, url: `/writing/${a.slug}`, title, description: a.meta.description, publishedTime: a.meta.date, authors: [site.name], images: ["/og.png"] },
    twitter: { card: "summary_large_image", title, description: a.meta.description, images: ["/og.png"] },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const all = articles();
  const i = all.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const a = all[i];
  const next = all[(i + 1) % all.length];
  const { nodes } = renderMarkdown(a.body);
  const ld = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: a.meta.title,
    description: a.meta.description,
    datePublished: a.meta.date,
    url: `${site.url}/writing/${a.slug}`,
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <div className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteHeader current="writing" />
      <main className="wrap article">
        <div className="narrow">
          <header className="article-head">
            <a className="label" href="/writing">← Writing</a>
            <h1>{a.meta.title}</h1>
            <p className="lede">{a.meta.description}</p>
            <p className="byline">{site.name} · {formatMonth(a.meta.date)} · {readingMinutes(a.body)} min read</p>
          </header>
          <article className="prose">{nodes}</article>
          <nav className="next-link" aria-label="Next article">
            <span className="label">Next article</span>
            <a href={`/writing/${next.slug}`}>{next.meta.title} <i>→</i></a>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
