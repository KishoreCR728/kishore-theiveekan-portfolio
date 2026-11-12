import "./pages.css";
import "./home.css";
import Experience from "@/lusion/Experience";
import Career from "@/components/home/Career";
import Writing from "@/components/home/Writing";
import LabTeaser from "@/components/home/LabTeaser";
import VideoBlock from "@/components/site/VideoBlock";
import { allCases } from "@/lib/cases";
import { articles } from "@/lib/content";
import { site } from "@/content/site";

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Frontend Engineer",
  url: site.url,
  email: `mailto:${site.email}`,
  sameAs: [site.linkedin, site.github],
  worksFor: { "@type": "Organization", name: "Finstein Advizory LLP" },
  address: { "@type": "PostalAddress", addressLocality: "Chennai", addressCountry: "IN" },
  knowsAbout: ["Frontend engineering", "Angular", "React", "Next.js", "TypeScript", "three.js", "Web performance", "Web security"],
};

const staticModeCheck = `(function(){try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("static-mode");return}var g=document.createElement("canvas").getContext("webgl2");if(!g){d.classList.add("static-mode");return}var i=g.getExtension("WEBGL_debug_renderer_info"),n=i?String(g.getParameter(i.UNMASKED_RENDERER_WEBGL)):"";var l=g.getExtension("WEBGL_lose_context");if(l)l.loseContext();if(/swiftshader|llvmpipe|software|basic render/i.test(n))d.classList.add("static-mode")}catch(e){}})();`;

export default function Home() {
  const flagships = allCases()
    .filter((c) => c.flagship)
    .map(({ slug, title, oneLiner, tags, status }) => ({ slug, title, oneLiner, tags, status: status ?? null }));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      {/* Decide before the first paint whether the 3D runs, so switching to the static layout never shifts the page. */}
      <script dangerouslySetInnerHTML={{ __html: staticModeCheck }} />
      <Experience
        flagships={flagships}
        slots={{
          afterWork: (
            <div className="lusion-insert wrap home">
              <Career />
            </div>
          ),
          afterJourney: (
            <div className="lusion-insert wrap home">
              <Writing posts={articles()} />
              <LabTeaser />
              <section className="block" aria-labelledby="inside-title">
                <div className="block-head">
                  <p className="label">How this site is built</p>
                  <h2 id="inside-title">Inside <i className="ac">this portfolio.</i></h2>
                  <p className="block-lede">A Next.js static export with custom React components, built with Claude Code as a pair. Self-hosted fonts and images, no cookies or trackers, six security headers, and release checks in real Chrome on every page at six widths. <a href={`${site.github}/kishore-theiveekan-portfolio`} target="_blank" rel="noopener noreferrer">Source on GitHub</a>.</p>
                </div>
                <div className="inside-video"><VideoBlock id="inside-portfolio" /></div>
              </section>
            </div>
          ),
        }}
      />
    </>
  );
}
