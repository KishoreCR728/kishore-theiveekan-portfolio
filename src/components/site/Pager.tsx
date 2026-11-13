/** Previous and next links at the end of a case study or an article. */
type Item = { href: string; title: string };

export default function Pager({ kind, prev, next }: { kind: string; prev: Item; next: Item }) {
  return (
    <nav className="pager" aria-label={`More ${kind}s`}>
      <a className="prev" rel="prev" href={prev.href}>
        <span className="label"><i aria-hidden="true">←</i> Previous {kind}</span>
        <b>{prev.title}</b>
      </a>
      <a className="next" rel="next" href={next.href}>
        <span className="label">Next {kind} <i aria-hidden="true">→</i></span>
        <b>{next.title}</b>
      </a>
    </nav>
  );
}
