import { site } from "@/content/site";

/** What a team can expect, each point backed by something on this site. */
const promises: { title: string; text: string; proof: string; href: string }[] = [
  {
    title: "Fixes you can check",
    text: "Each fix comes with a way to verify it: a test, a curl command, or a before-and-after number.",
    proof: "Security headers proved with curl on production",
    href: "/work/erp-product-platform",
  },
  {
    title: "Mistakes owned, not hidden",
    text: "When something I built breaks, I explain the cause, fix it, and add a check so it can't come back.",
    proof: "My fallback shipped blank pages; now the build blocks them",
    href: "/writing/blank-page-build-gate",
  },
  {
    title: "Quality kept in the build",
    text: "SEO, translations and page content are checked on every build, so standards don't depend on anyone's memory.",
    proof: "Six blocking build steps on a large multilingual site",
    href: "/work/privacy-advisory-site",
  },
  {
    title: "Decisions written down",
    text: "Tradeoffs, incidents and handovers in plain English, so the next person doesn't have to ask.",
    proof: "Every case study and article on this site",
    href: "/writing",
  },
  {
    title: "AI used openly",
    text: "I work with Claude Code as a pair and say so. The decisions and the verification stay mine.",
    proof: "Jarvis: designed and tested by me, built with Claude Code",
    href: "/work/jarvis-assistant",
  },
];

const facts: [string, string][] = [
  ["Role", "Frontend engineer · 3.5+ years"],
  ["Based in", "Chennai, India · IST (UTC+5:30)"],
  ["Works in", "English, written and spoken"],
  ["Stack", "Angular, React, Next.js, TypeScript"],
];

export default function WorkingWithMe() {
  return (
    <section id="working" className="block" aria-labelledby="working-title">
      <div className="block-head">
        <p className="label">Working with me</p>
        <h2 id="working-title">What you can <i className="ac">expect from me.</i></h2>
      </div>
      <div className="wwm">
        <aside className="wwm-card" aria-label="Quick facts">
          <dl>
            {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <p className="wwm-note">Hiring for a frontend role? Email is the quickest way to reach me.</p>
          <div className="wwm-actions">
            <a className="pill light" href={`mailto:${site.email}`}>Email me</a>
            <a className="pill ghost" href="/Kishore-Theiveekan-CV.pdf">Download CV</a>
            <a className="pill ghost" href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </aside>
        <ol className="wwm-list">
          {promises.map((p, i) => (
            <li key={p.title}>
              <span className="wwm-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
                <a href={p.href}>{p.proof} <i aria-hidden="true">→</i></a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
