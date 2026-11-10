import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudy from "@/components/CaseStudy";
import { projects } from "@/content/portfolio";
import { site } from "@/content/site";

type Project = { slug: string; name: string; short: string; overview: string };
const all = projects as Project[];
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return all.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = all.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.name, description: `${p.short} ${p.overview}`.slice(0, 158), alternates: { canonical: `/work/${p.slug}` }, twitter: { card: "summary_large_image", title: `${p.name} | ${site.name}`, description: p.short, images: ["/og.png"] }, openGraph: { type: "article", siteName: site.name, url: `/work/${p.slug}`, title: `${p.name} | ${site.name}`, description: p.short, images: ["/og.png"] } };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const i = all.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = all[i];
  const ld = { "@context": "https://schema.org", "@type": "CreativeWork", name: p.name, description: p.overview, url: `${site.url}/work/${p.slug}`, author: { "@type": "Person", name: site.name, url: site.url } };
  return (<><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /><CaseStudy index={i} /></>);
}
