import { site } from "@/content/site";
import VideoBlock from "@/components/site/VideoBlock";

export default function Contact() {
  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <p className="label">Contact</p>
      <h2 id="contact-title">Start a <i className="ac">conversation.</i></h2>
      <a className="contact-mail" href={`mailto:${site.email}`}>{site.email}</a>
      <div className="hero-actions">
        <a className="pill" href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a className="pill" href={site.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a className="pill" href="/Kishore-Theiveekan-CV.pdf">Download CV</a>
      </div>
      <div className="colophon-video"><VideoBlock id="inside-portfolio" /></div>
      <p className="colophon">How this site is built: a Next.js static export with hand-written React components, self-hosted fonts and images, no cookies or trackers, six security headers, and release checks in real Chrome at six screen widths. <a href={`${site.github}/kishore-theiveekan-portfolio`} target="_blank" rel="noopener noreferrer">Source on GitHub</a>.</p>
    </section>
  );
}
