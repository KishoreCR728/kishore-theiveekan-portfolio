/* Header and footer shared by the content pages (case studies and writing). */
import { site } from "@/content/site";

type Section = "home" | "work" | "writing" | undefined;

export function SiteHeader({ current }: { current?: Section }) {
  return (
    <header className="site-head">
      <a className="brand" href="/">{site.name}</a>
      <nav aria-label="Main">
        <a className="pill hide-sm" href="/#work" aria-current={current === "work" ? "page" : undefined}>Work</a>
        <a className="pill" href="/writing" aria-current={current === "writing" ? "page" : undefined}>Writing</a>
        <a className="pill hide-sm" href="/Kishore-Theiveekan-CV.pdf">CV</a>
        <a className="pill dark" href={`mailto:${site.email}`}>Contact</a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <span>{site.name} · Frontend engineer · Chennai, India · open to relocation</span>
      <nav aria-label="Elsewhere">
        <a href={`mailto:${site.email}`}>Email</a>
        <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="/Kishore-Theiveekan-CV.pdf">CV</a>
      </nav>
    </footer>
  );
}
