import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../pages.css";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { articles, formatMonth, readingMinutes } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/content/site";
import VideoBlock from "@/components/site/VideoBlock";
import BackLink from "@/components/site/BackLink";
import Pager from "@/components/site/Pager";
import { CaseFile } from "@/components/home/Writing";
import "../../home.css";

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
    openGraph: { type: "article", siteName: site.name, url: `/writing/${a.slug}`, title, description: a.meta.description, publishedTime: a.meta.date, authors: [site.name], images: [`/og/writing-${a.slug}.png`] },
    twitter: { card: "summary_large_image", title, description: a.meta.description, images: [`/og/writing-${a.slug}.png`] },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const all = articles();
  const i = all.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const a = all[i];
  const next = all[(i + 1) % all.length];
  const prev = all[(i - 1 + all.length) % all.length];
  const { nodes } = renderMarkdown(a.body);
  const ld = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: a.meta.title,
    description: a.meta.description,
    datePublished: a.meta.date,
    dateModified: a.meta.date,
    url: `${site.url}/writing/${a.slug}`,
    mainEntityOfPage: `${site.url}/writing/${a.slug}`,
    image: `${site.url}/og/writing-${a.slug}.png`,
    inLanguage: "en",
    author: { "@type": "Person", name: site.name, url: site.url, sameAs: [site.linkedin, site.github] },
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Writing", item: `${site.url}/writing` },
      { "@type": "ListItem", position: 3, name: a.meta.title, item: `${site.url}/writing/${a.slug}` },
    ],
  };

  return (
    <div className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs).replace(/</g, "\\u003c") }} />
      <SiteHeader current="writing" />
      <main id="main" className="wrap article">
        <div className="narrow">
          <header className="article-head">
            <BackLink fallback="/writing" label="Back" />
            <h1>{a.meta.title}</h1>
            <p className="lede">{a.meta.description}</p>
            <p className="byline">{site.name} · {formatMonth(a.meta.date)} · {readingMinutes(a.body)} min read</p>
          </header>
          <section className="at-a-glance" aria-label="At a glance">
            <p className="label">At a glance</p>
            <CaseFile meta={a.meta} />
          </section>
          <article className="prose">{a.meta.video && <VideoBlock id={a.meta.video} />}{nodes}</article>
          <aside className="author-card" aria-label="About the author">
            <p><b>{site.name}</b> · Frontend engineer in Chennai, open to relocation worldwide.</p>
            <div>
              <a className="pill dark" href={`mailto:${site.email}`}>Email</a>
              <a className="pill" href="/Kishore-Theiveekan-CV.pdf">CV</a>
              <a className="pill" href="/#work">Case studies</a>
            </div>
          </aside>
          <Pager kind="article" prev={{ href: `/writing/${prev.slug}`, title: prev.meta.title }} next={{ href: `/writing/${next.slug}`, title: next.meta.title }} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
