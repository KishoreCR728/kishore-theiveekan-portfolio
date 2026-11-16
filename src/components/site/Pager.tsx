/**
 * Previous and next links at the end of a case study or an article.
 * Two equal halves of the content width; each card carries enough (thumbnail, title, one line) to use it.
 */
type Item = { href: string; title: string; line?: string; image?: string };

function Card({ item, dir, kind }: { item: Item; dir: "prev" | "next"; kind: string }) {
  return (
    <a className={dir} rel={dir} href={item.href}>
      {item.image && <img className="pager-thumb" src={item.image} alt="" width={160} height={90} loading="lazy" decoding="async" />}
      <span className="pager-text">
        <span className="label">{dir === "prev" ? <><i aria-hidden="true">←</i> Previous {kind}</> : <>Next {kind} <i aria-hidden="true">→</i></>}</span>
        <b>{item.title}</b>
        {item.line && <span className="pager-line">{item.line}</span>}
      </span>
    </a>
  );
}

export default function Pager({ kind, prev, next }: { kind: string; prev: Item; next: Item }) {
  return (
    <nav className="pager" aria-label={kind === "case study" ? "More case studies" : `More ${kind}s`}>
      <Card item={prev} dir="prev" kind={kind} />
      <Card item={next} dir="next" kind={kind} />
    </nav>
  );
}
