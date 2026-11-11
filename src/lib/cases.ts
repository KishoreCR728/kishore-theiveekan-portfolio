/*
 * One list of case studies for every page that needs them.
 * Flagships are full write-ups in src/content/work/*.md. The shorter ones still
 * come from src/content/portfolio.js and are turned into the same shape here.
 */
import { caseStudies } from "./content";
import { projects } from "@/content/portfolio";

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
    metrics: ["metric1", "metric2", "metric3"].filter((m) => meta[m]).map((m) => meta[m].split("|") as [string, string]),
    code: meta.code,
    video: meta.video,
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
      tags: p.tags.split("•").map((t) => t.trim()),
      flagship: false,
      facts: [["Role", p.own], ["When", p.when], ["Stack", p.stack]],
      metrics: p.results.map(([v, l]) => [v, l] as [string, string]),
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
