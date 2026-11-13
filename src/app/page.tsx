import fs from "fs";
import path from "path";
import "./pages.css";
import "./home.css";
import "@fontsource/instrument-serif/400.css"; // only for the city chapter signs drawn on canvas
import "@/home/lusion.css";
import "@/home/hover.css";
import { PageMarkup } from "@/home/Markup";
import { buildView, runtimeData, type Flagship } from "@/home/view";
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

// Decides before the first paint whether the 3D runs, so switching to the static layout never shifts the page.
const staticModeCheck = `(function(){try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("static-mode");return}var g=document.createElement("canvas").getContext("webgl2");if(!g){d.classList.add("static-mode");return}var i=g.getExtension("WEBGL_debug_renderer_info"),n=i?String(g.getParameter(i.UNMASKED_RENDERER_WEBGL)):"";var l=g.getExtension("WEBGL_lose_context");if(l)l.loseContext();if(/swiftshader|llvmpipe|software|basic render/i.test(n))d.classList.add("static-mode")}catch(e){}})();`;

/** The browser module's file name carries a content hash (scripts/build-runtime.mjs writes the manifest). */
function runtimeEntry(): string {
  const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/home/manifest.json"), "utf8")) as { entry: string };
  return manifest.entry;
}

/** Loads the browser module after the page's load event, so text and images paint first. */
const loadRuntime = (src: string) =>
  `(function(){function go(){import(${JSON.stringify(src)})}if(document.readyState==="complete")setTimeout(go,0);else addEventListener("load",function(){setTimeout(go,0)},{once:true})})();`;

const json = (x: unknown) => JSON.stringify(x).replace(/</g, "\\u003c");

export default function Home() {
  const flagships: Flagship[] = allCases()
    .filter((c) => c.flagship)
    .map(({ slug, title, oneLiner, tags, status }) => ({ slug, title, oneLiner, tags, status: status ?? null }));
  const view = buildView(flagships, {
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
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(person) }} />
      <script dangerouslySetInnerHTML={{ __html: staticModeCheck }} />
      <PageMarkup v={view} />
      <script id="home-data" type="application/json" dangerouslySetInnerHTML={{ __html: json(runtimeData(flagships)) }} />
      <script dangerouslySetInnerHTML={{ __html: loadRuntime(runtimeEntry()) }} />
    </>
  );
}
