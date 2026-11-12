import type { Doc } from "@/lib/content";
import { readingMinutes } from "@/lib/content";

/** The four-line case file shown for each bug story (also used at the top of each article). */
export function CaseFile({ meta, compact }: { meta: Record<string, string>; compact?: boolean }) {
  const rows: [string, string][] = [["Problem", meta.problem], ["How I found it", meta.found], ["What I did", meta.fix], ["Result", meta.result]];
  return (
    <dl className={compact ? "case-file compact" : "case-file"}>
      {rows.filter(([, v]) => v).map(([k, v]) => (
        <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  );
}

export default function Writing({ posts }: { posts: Doc[] }) {
  return (
    <section id="writing" className="block" aria-labelledby="writing-title">
      <div className="block-head">
        <p className="label">Field notes</p>
        <h2 id="writing-title">Real bugs, <i className="ac">and how I handled them.</i></h2>
        <p className="block-lede">Production problems from my work: what broke, how I found the cause, what I changed and what it achieved. Client names are hidden, and each says what was done with an AI coding agent.</p>
      </div>
      <ul className="bug-grid">
        {posts.map((p) => (
          <li key={p.slug}>
            <a href={`/writing/${p.slug}`} className="bug-card">
              <span className="bug-topic">{p.meta.topic} · {readingMinutes(p.body)} min read</span>
              <h3>{p.meta.title}</h3>
              <CaseFile meta={p.meta} compact />
              <span className="bug-more">Read the full story <span aria-hidden="true">→</span></span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
