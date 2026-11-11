import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../pages.css";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { CaseDiagram } from "@/components/site/Diagrams";
import VideoBlock from "@/components/site/VideoBlock";
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
  const { nodes } = renderMarkdown(c.body);
  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: c.title,
    description: c.description,
    url: `${site.url}/work/${c.slug}`,
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <div className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteHeader current="work" />
      <main id="main" className="wrap">
        <header className="hero-block">
          <div className="label">Case study{c.flagship ? "" : " · short"}</div>
          <h1>{c.title}</h1>
          <p className="lede">{c.oneLiner}</p>
          {c.status && <p className="status">{c.status}</p>}
          <ul className="chips" aria-label="Technologies">
            {c.tags.map((t) => <li key={t} className="chip">{t}</li>)}
          </ul>
        </header>

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

        <nav className="next-link" aria-label="Next case study">
          <span className="label">Next case study</span>
          <a href={`/work/${next.slug}`}>{next.title} <i>→</i></a>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
