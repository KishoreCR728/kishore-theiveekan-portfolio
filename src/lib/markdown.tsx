/*
 * A small Markdown renderer for the case studies and articles in src/content.
 * It returns React elements (never raw HTML), so content can't inject markup.
 * Supported: ## / ### headings, paragraphs, - and 1. lists, ``` code blocks,
 * > callouts, | tables |, and inline **bold**, *italic*, `code`, [links](url).
 * Malformed input (unsafe link, unclosed fence, headerless table) fails the build.
 */
import type { ReactNode } from "react";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[`*_]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function inline(text: string, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(re)) {
    const tok = m[0];
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const k = `${key}-${n++}`;
    if (tok.startsWith("**")) out.push(<strong key={k}>{inline(tok.slice(2, -2), k)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={k}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[")) {
      const [, label, href] = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/) ?? [];
      if (!/^(https?:\/\/|\/(?!\/)|#|mailto:)/.test(href ?? "")) throw new Error(`Unsafe or malformed link in Markdown: ${tok}`);
      const safe = href;
      const ext = safe.startsWith("http");
      out.push(
        <a key={k} href={safe} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {inline(label, k)}
        </a>,
      );
    } else out.push(<em key={k}>{inline(tok.slice(1, -1), k)}</em>);
    last = at + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

export function renderMarkdown(src: string): { nodes: ReactNode[] } {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  const used = new Map<string, number>();
  const uniqueId = (text: string) => { const base = slugify(text) || "section"; const n = used.get(base) ?? 0; used.set(base, n + 1); return n ? `${base}-${n + 1}` : base; };
  let i = 0;
  let k = 0;
  const isBlockStart = (l: string) => /^(#{2,3} |```|> ?|- |\d+\. |\|)/.test(l) || l.trim() === "";

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) body.push(lines[i++]);
      if (i >= lines.length) throw new Error("Unclosed code fence in Markdown");
      i++;
      nodes.push(
        <pre key={k++} data-lang={lang || undefined} tabIndex={0} aria-label={lang ? `${lang} code` : "Code"}>
          <code>{body.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const h = line.match(/^(#{2,3}) (.+)$/);
    if (h) {
      const text = h[2].trim();
      const id = uniqueId(text);
      if (h[1] === "##") {
        nodes.push(<h2 key={k++} id={id}>{inline(text)}</h2>);
      } else nodes.push(<h3 key={k++} id={id}>{inline(text)}</h3>);
      i++;
      continue;
    }

    if (line.startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) body.push(lines[i++].replace(/^> ?/, ""));
      const paras = body.join("\n").split(/\n\s*\n/);
      nodes.push(
        <div key={k++} className="callout" role="note">
          {paras.map((p, j) => <p key={j}>{inline(p.replace(/\n/g, " "), `c${j}`)}</p>)}
        </div>,
      );
      continue;
    }

    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!/^\|[\s:|-]+\|$/.test(lines[i].trim())) rows.push(cells(lines[i]));
        i++;
      }
      const [head, ...body] = rows;
      if (!head) throw new Error("Markdown table without a header row");
      nodes.push(
        <div key={k++} className="table-wrap">
          <table>
            <thead><tr>{head.map((c, j) => <th key={j} scope="col">{inline(c, `h${j}`)}</th>)}</tr></thead>
            <tbody>{body.map((r, j) => <tr key={j}>{r.map((c, m) => <td key={m}>{inline(c, `t${j}${m}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }

    const list = line.match(/^(- |\d+\. )/);
    if (list) {
      const ordered = list[1] !== "- ";
      const start = ordered ? parseInt(list[1], 10) : 1;
      const items: string[] = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) {
        let item = lines[i++].replace(/^(- |\d+\. )/, "");
        while (i < lines.length && /^ {2,}\S/.test(lines[i])) item += " " + lines[i++].trim();
        items.push(item);
      }
      const lis = items.map((t, j) => <li key={j}>{inline(t, `l${j}`)}</li>);
      nodes.push(ordered ? <ol key={k++} start={start === 1 ? undefined : start}>{lis}</ol> : <ul key={k++}>{lis}</ul>);
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && !isBlockStart(lines[i])) para.push(lines[i++]);
    if (!para.length) para.push(lines[i++]);
    nodes.push(<p key={k++}>{inline(para.join(" "))}</p>);
  }
  return { nodes };
}
