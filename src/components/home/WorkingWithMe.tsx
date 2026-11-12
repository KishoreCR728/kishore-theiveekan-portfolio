import { site } from "@/content/site";

const items: [string, string][] = [
  ["Time zone", "Chennai, IST (UTC+5:30): my working day overlaps European mornings"],
  ["Working language", "English, written and spoken"],
  ["Open to", "Relocation to Europe, or remote work"],
  ["Ways of working", "Pull requests, written updates and async work; comfortable with code review and UAT cycles"],
];

export default function WorkingWithMe() {
  return (
    <section id="working" className="block" aria-labelledby="working-title">
      <div className="block-head">
        <p className="label">Working with me</p>
        <h2 id="working-title">Ready to work <i className="ac">across time zones.</i></h2>
      </div>
      <dl className="working">
        {items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      <div className="working-actions">
        <a className="pill dark" href={`mailto:${site.email}`}>Email me</a>
        <a className="pill" href="/Kishore-Theiveekan-CV.pdf">Download CV</a>
        <a className="pill" href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </section>
  );
}
