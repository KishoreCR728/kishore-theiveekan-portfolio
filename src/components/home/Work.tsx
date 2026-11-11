import type { Case } from "@/lib/cases";

export default function Work({ cases }: { cases: Case[] }) {
  return (
    <section id="work" className="block" aria-labelledby="work-title">
      <div className="block-head">
        <p className="label">Selected work</p>
        <h2 id="work-title">Four projects, <i className="ac">in depth.</i></h2>
        <p className="block-lede">Each case study covers the problem, the decisions and their tradeoffs, what broke, and the numbers. Client names are hidden.</p>
      </div>
      <ol className="work-list">
        {cases.map((c, i) => (
          <li key={c.slug}>
            <a className="work-card" href={`/work/${c.slug}`}>
              <span className="work-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="work-main">
                <h3>{c.title}{c.status && <span className="tag-unreleased">Unreleased</span>}</h3>
                <p>{c.oneLiner}</p>
                <p className="work-tags">{c.tags.join(" · ")}</p>
              </div>
              <dl className="work-metrics">
                {c.metrics.map(([v, l]) => (
                  <div key={l}><dt>{l}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              <span className="work-go" aria-hidden="true">→</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
