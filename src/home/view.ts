/*
 * Builds the values the home markup renders. Runs at build time only.
 * Same data and ordering the client component used before the rewrite; nothing here is interactive.
 */
import type { ReactNode } from "react";
import { projects, contributed, timeline, stacks } from "@/content/portfolio";

export type Flagship = { slug: string; title: string; oneLiner: string; tags: string[]; status: string | null };
export type Slots = { afterWork?: ReactNode; afterJourney?: ReactNode; beforeContact?: ReactNode };

/** Splits a heading into words so each can rise in on its own. */
const words = (text: string) => text.split(" ").map((t) => ({ t }));

const SPANS = ["7", "5", "5", "7", "6", "6", "5", "7", "7", "5"];
const RATIOS = ["3/2", "4/3", "4/3", "3/2", "4/3", "4/3", "4/3", "3/2", "3/2", "4/3"];

export function buildView(flagships: Flagship[], slots: Slots) {
  // The four full case studies first (with their checked one-liners), then the shorter ones.
  const ordered = [
    ...flagships.map((f) => {
      const p = projects.find((x) => x.slug === f.slug);
      if (!p) throw new Error(`flagship ${f.slug} has no entry in portfolio.js`);
      return { ...p, name: f.status ? `${f.title} (unreleased)` : f.title, short: f.oneLiner, tags: f.tags.join(" • ").toLowerCase() };
    }),
    ...projects.filter((p) => !flagships.some((f) => f.slug === p.slug)),
  ];
  return {
    // The loader and the menu are in the HTML from the start; the browser module animates them.
    loaderOn: true,
    topT: "translateY(0)",
    botT: "translateY(0)",
    loaderTextO: "1",
    count: 0,
    word: "Curious.",
    time: "",
    menuOpen: false,
    menuLabel: "Menu",
    wIntro: words("Angular and React interfaces, from the first component to production."),
    wStatement: words("Built to ship, index and pass review."),
    wWork: words("Selected work."),
    wStack: words("Tools in production use."),
    wContact: words("Let's talk."),
    projects: ordered.map((p, i) => ({ ...p, href: `/work/${p.slug}`, num: String(i + 1).padStart(2, "0"), span: SPANS[i], ratio: RATIOS[i], offset: i % 2 ? "10vh" : "0" })),
    slots,
    heroProjects: flagships.map(({ slug, title, oneLiner, tags, status }) => ({ slug, title, oneLiner, tags: tags.slice(0, 2).join(" · "), status: status ? status.split(" ")[0] : null })),
    contributed: contributed.map(([name, share, desc]) => ({ name, share, desc })),
    timeline: timeline.map((y) => ({ ...y, chips: (y.tags || []).map((t: string) => ({ t })), short: (y.k || "").split("·").pop()!.trim() })),
    stacks: stacks.map(([name, items]) => ({ name, items: (items as string[]).map((t) => ({ t })) })),
  };
}

export type HomeView = ReturnType<typeof buildView>;

/** What the browser module needs: the hero titles and the journey chapter signs. Embedded as JSON. */
export function runtimeData(flagships: Flagship[]) {
  return {
    flagships: flagships.map(({ slug, title, oneLiner }) => ({ slug, title, oneLiner })),
    chapters: timeline.map((t) => [t.y, t.t] as [string, string]),
  };
}
export type RuntimeData = ReturnType<typeof runtimeData>;
