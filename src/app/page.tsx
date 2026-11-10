import Experience from "@/components/Experience";
import { projects } from "@/content/portfolio";
import { site } from "@/content/site";

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Frontend Engineer",
  url: site.url,
  email: `mailto:${site.email}`,
  sameAs: [site.linkedin, site.github],
  address: { "@type": "PostalAddress", addressLocality: "Chennai", addressCountry: "IN" },
  knowsAbout: ["Frontend engineering", "Angular", "React", "Next.js", "TypeScript", "three.js", "Web performance", "Web security"],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <Experience />
      <nav aria-label="Case studies" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        {projects.map((p: { slug: string; name: string }) => <a key={p.slug} href={`/work/${p.slug}`} tabIndex={-1}>{p.name}</a>)}
      </nav>
    </>
  );
}
