import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../pages.css";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { CaseDiagram } from "@/components/site/Diagrams";
import VideoBlock from "@/components/site/VideoBlock";
import BackLink from "@/components/site/BackLink";
import Pager from "@/components/site/Pager";
import { allCases } from "@/lib/cases";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allCases().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = allCases().find((x) => x.slug === slug);
  if (!c) return {};
  const title = `${c.title} | ${site.name}`;
  const image = c.flagship ? `/og/work-${c.slug}.png` : "/og.png";
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: { type: "article", siteName: site.name, url: `/work/${c.slug}`, title, description: c.oneLiner, images: [image] },
    twitter: { card: "summary_large_image", title, description: c.oneLiner, images: [image] },
  };
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const cases = allCases();
  const i = cases.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const c = cases[i];
  const next = cases[(i + 1) % cases.length];
  const prev = cases[(i - 1 + cases.length) % cases.length];
  const { nodes } = renderMarkdown(c.body);
  const image = c.flagship ? `/og/work-${c.slug}.png` : "/og.png";
  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${site.url}/work/${c.slug}#work`,
    isPartOf: { "@id": `${site.url}/#website` },
    image: `${site.url}${image}`,
    name: c.title,
    description: c.description,
    url: `${site.url}/work/${c.slug}`,
    keywords: c.tags.join(", "),
    inLanguage: "en",
    author: { "@type": "Person", "@id": `${site.url}/#person`, name: site.name, url: site.url, sameAs: [site.linkedin, site.github] },
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Work", item: `${site.url}/#work` },
      { "@type": "ListItem", position: 3, name: c.title, item: `${site.url}/work/${c.slug}` },
    ],
  };

  return (
    <div className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs).replace(/</g, "\\u003c") }} />
      <SiteHeader current="work" />
      <main id="main" className="wrap">
        <header className="hero-block">
          <BackLink fallback="/#work" label="Back to selected work" />
          <div className="label">Case study{c.flagship ? "" : " · short"}</div>
          <h1>{c.title}</h1>
          <p className="lede">{c.oneLiner}</p>
          {c.status && <p className="status">{c.status}</p>}
          <ul className="chips" aria-label="Technologies">
            {c.tags.map((t) => <li key={t} className="chip">{t}</li>)}
          </ul>
          <img className="case-visual" src={`/images/work/${c.slug}.svg`} alt="" width={1200} height={800} decoding="async" />
        </header>

        {c.impact.length > 0 && (
          <section className="impact" aria-label="My impact">
            <p className="label">My impact</p>
            <ul>{c.impact.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
        )}

        {c.metrics.length > 0 && (
          <section className="metrics" aria-label="Key numbers">
            {c.metrics.map(([v, l]) => (
              <div key={l} className="metric"><b>{v}</b><span>{l}</span></div>
            ))}
          </section>
        )}

        <CaseDiagram slug={c.slug} />
        {c.video && <VideoBlock id={c.video} note={c.video === "jarvis" ? "the console footage is a real recording; the model and safety scenes are animated from the code" : undefined} />}

        <div className="case-grid">
          <dl className="facts">
            {c.facts.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
            {c.code && (
              <div><dt>Code</dt><dd><a href={c.code} target="_blank" rel="noopener noreferrer">{c.code.replace("https://", "")}</a></dd></div>
            )}
          </dl>
          <article className="prose">{nodes}</article>
        </div>

        <Pager kind="case study" prev={{ href: `/work/${prev.slug}`, title: prev.title }} next={{ href: `/work/${next.slug}`, title: next.title }} />
      </main>
      <SiteFooter />
    </div>
  );
}
