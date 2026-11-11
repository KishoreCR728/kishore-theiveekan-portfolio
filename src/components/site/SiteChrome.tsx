/* Header and footer shared by the content pages (case studies and writing). */
import { site } from "@/content/site";

type Section = "home" | "work" | "writing" | "lab" | undefined;

export function SiteHeader({ current }: { current?: Section }) {
  return (
    <>
    <a className="skip" href="#main">Skip to content</a>
    <header className="site-head">
      <a className="brand" href="/"><span className="brand-full">{site.name}</span><span className="brand-short">Kishore T.</span></a>
      <nav aria-label="Main">
        <a className="pill" href="/#work" aria-current={current === "work" ? "page" : undefined}>Work</a>
        <a className="pill hide-sm" href="/writing" aria-current={current === "writing" ? "page" : undefined}>Writing</a>
        <a className="pill hide-md" href="/lab" aria-current={current === "lab" ? "page" : undefined}>Lab</a>
        <a className="pill" href="/Kishore-Theiveekan-CV.pdf">CV</a>
        <a className="pill dark" href={`mailto:${site.email}`}>Contact</a>
      </nav>
    </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <span>{site.name} · Frontend engineer · Chennai, India · open to relocation</span>
      <nav aria-label="Elsewhere">
        <a href="/#work">Work</a>
        <a href="/writing">Writing</a>
        <a href="/lab">Lab</a>
        <a href={`mailto:${site.email}`}>Email</a>
        <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="/Kishore-Theiveekan-CV.pdf">CV</a>
      </nav>
    </footer>
  );
}
