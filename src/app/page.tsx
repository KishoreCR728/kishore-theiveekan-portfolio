import "./pages.css";
import "./home.css";
import Experience from "@/lusion/Experience";
import Career from "@/components/home/Career";
import Writing from "@/components/home/Writing";
import WorkingWithMe from "@/components/home/WorkingWithMe";
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
  alumniOf: { "@type": "CollegeOrUniversity", name: "Park College of Engineering and Technology" },
  knowsAbout: ["Frontend engineering", "Angular", "React", "Next.js", "TypeScript", "three.js", "Web performance", "Web security"],
};

const staticModeCheck = `(function(){try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("static-mode");return}var g=document.createElement("canvas").getContext("webgl2");if(!g){d.classList.add("static-mode");return}var i=g.getExtension("WEBGL_debug_renderer_info"),n=i?String(g.getParameter(i.UNMASKED_RENDERER_WEBGL)):"";var l=g.getExtension("WEBGL_lose_context");if(l)l.loseContext();if(/swiftshader|llvmpipe|software|basic render/i.test(n))d.classList.add("static-mode")}catch(e){}})();`;

export default function Home() {
  const flagships = allCases()
    .filter((c) => c.flagship)
    .map(({ slug, title, oneLiner, tags, status }) => ({ slug, title, oneLiner, tags, status: status ?? null }));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
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
            </div>
          ),
          beforeContact: (
            <div className="lusion-insert wrap home">
              <WorkingWithMe />
            </div>
          ),
        }}
      />
    </>
  );
}
