/*
 * Reads the Markdown case studies (src/content/work) and articles
 * (src/content/writing) at build time. Each file starts with a front matter
 * block of `key: value` lines between `---` markers.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "src", "content");

export type Doc = { slug: string; meta: Record<string, string>; body: string };

function parse(file: string): Doc {
  const raw = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Missing front matter in ${file}`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const at = line.indexOf(": ");
    if (at > 0) meta[line.slice(0, at).trim()] = line.slice(at + 2).trim();
  }
  for (const req of ["title", "description"]) if (!meta[req]) throw new Error(`${file}: missing "${req}"`);
  return { slug: path.basename(file, ".md"), meta, body: m[2].trim() };
}

function list(dir: string): Doc[] {
  const d = path.join(root, dir);
  return fs
    .readdirSync(d)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parse(path.join(d, f)))
    .sort((a, b) => Number(a.meta.order ?? 99) - Number(b.meta.order ?? 99));
}

export const caseStudies = () => list("work");
export const articles = () => list("writing");

/** Reading time at about 230 words a minute, code blocks included. */
export const readingMinutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).length / 230));

export const formatMonth = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
