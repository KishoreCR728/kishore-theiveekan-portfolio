/*
 * One list of case studies for every page that needs them.
 * Flagships are full write-ups in src/content/work/*.md. The shorter ones still
 * come from src/content/portfolio.js and are turned into the same shape here.
 */
import { caseStudies } from "./content";
import { projects } from "@/content/portfolio";

const TAG_NAMES: Record<string, string> = {
  vite: "Vite", playwright: "Playwright", "lighthouse ci": "Lighthouse CI", vercel: "Vercel", html: "HTML", scss: "SCSS", css: "CSS",
  puppeteer: "Puppeteer", python: "Python", "aws amplify": "AWS Amplify", javascript: "JavaScript", "gitlab ci": "GitLab CI",
  "node tooling": "Node tooling", nginx: "Nginx", aeo: "AEO", process: "Process", csp: "CSP", hsts: "HSTS", sonarqube: "SonarQube",
  "next.js 16": "Next.js 16", "react 19": "React 19", typescript: "TypeScript",
};
const tagName = (t: string) => TAG_NAMES[t.toLowerCase()] ?? t.charAt(0).toUpperCase() + t.slice(1);


export type Case = {
  slug: string;
  title: string;
  description: string;
  oneLiner: string;
  tags: string[];
  status?: string;
  flagship: boolean;
  facts: [string, string][];
  metrics: [string, string][];
  code?: string;
  video?: string;
  impact: string[];
  body: string;
};

type Legacy = {
  slug: string; name: string; short: string; tags: string; own: string; when: string; stack: string;
  overview: string; problem: string; built: string[]; results: string[][]; how: string;
};

const fromMarkdown = (): Case[] =>
  caseStudies().map(({ slug, meta, body }) => ({
    slug,
    title: meta.title,
    description: meta.description,
    oneLiner: meta.oneLiner ?? meta.description,
    tags: (meta.tags ?? "").split("·").map((t) => t.trim()).filter(Boolean),
    status: meta.status,
    flagship: true,
    facts: (
      [["Role", meta.role], ["When", meta.when], ["Team", meta.team], ["Stack", meta.stack], ["Scale", meta.scale], ["Proof", meta.proof], ["AI use", meta.ai]] as [string, string | undefined][]
    ).filter((f): f is [string, string] => Boolean(f[1])),
    metrics: ["metric1", "metric2", "metric3"].filter((m) => meta[m]).map((m) => {
      const [value, label] = meta[m].split("|");
      if (!value || !label) throw new Error(`work/${slug}.md: ${m} must be "value|label"`);
      return [value.trim(), label.trim()] as [string, string];
    }),
    code: meta.code,
    video: meta.video,
    impact: ["impact1", "impact2", "impact3"].map((k) => meta[k]).filter(Boolean),
    body,
  }));

const fromLegacy = (skip: Set<string>): Case[] =>
  (projects as Legacy[])
    .filter((p) => !skip.has(p.slug))
    .map((p) => ({
      slug: p.slug,
      title: p.name,
      description: `${p.short} ${p.overview}`.slice(0, 158),
      oneLiner: p.short,
      tags: p.tags.split("•").map((t) => tagName(t.trim())),
      flagship: false,
      facts: [["Role", p.own], ["When", p.when], ["Stack", p.stack]],
      metrics: p.results.map(([v, l]) => [v, l] as [string, string]),
      impact: [],
      body: [
        "## Overview", p.overview,
        "## The problem", p.problem,
        "## What I built", p.built.map((b) => `- ${b}`).join("\n"),
        "## How AI was used", p.how,
      ].join("\n\n"),
    }));

let cache: Case[] | undefined;
export function allCases(): Case[] {
  if (!cache) {
    const flagships = fromMarkdown();
    cache = [...flagships, ...fromLegacy(new Set(flagships.map((c) => c.slug)))];
  }
  return cache;
}
