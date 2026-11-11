import "./pages.css";
import "./home.css";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import Hero from "@/components/home/Hero";
import Work from "@/components/home/Work";
import Career from "@/components/home/Career";
import MoreWork from "@/components/home/MoreWork";
import Writing from "@/components/home/Writing";
import LabTeaser from "@/components/home/LabTeaser";
import Skills from "@/components/home/Skills";
import About from "@/components/home/About";
import Contact from "@/components/home/Contact";
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

export default function Home() {
  return (
    <div className="page home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <a className="skip" href="#work">Skip to the work</a>
      <SiteHeader current="home" />
      <main className="wrap">
        <Hero />
        <Work cases={allCases().filter((c) => c.flagship)} />
        <Career />
        <MoreWork />
        <LabTeaser />
        <Writing posts={articles()} />
        <Skills />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
