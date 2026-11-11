/* llms.txt for answer engines, generated from the same content as the pages. */
import { allCases } from "@/lib/cases";
import { articles } from "@/lib/content";
import { hero } from "@/content/home";
import { site } from "@/content/site";

export const dynamic = "force-static";

export function GET() {
  const cases = allCases();
  const lines = [
    `# ${site.name}`,
    "",
    `> Frontend engineer based in Chennai, India, open to relocation and remote work worldwide. Builds fast, secure web products with Angular, React, Next.js, TypeScript and three.js. At Finstein since March 2023.`,
    "",
    hero.line,
    "",
    "## Contact",
    `- Email: ${site.email}`,
    `- LinkedIn: ${site.linkedin}`,
    `- GitHub: ${site.github}`,
    `- CV: ${site.url}/Kishore-Theiveekan-CV.pdf`,
    "",
    "## Case studies",
    ...cases.filter((c) => c.flagship).map((c) => `- [${c.title}](${site.url}/work/${c.slug}): ${c.oneLiner}`),
    "",
    "## Shorter case studies",
    ...cases.filter((c) => !c.flagship).map((c) => `- [${c.title}](${site.url}/work/${c.slug}): ${c.oneLiner}`),
    "",
    "## Writing",
    ...articles().map((a) => `- [${a.meta.title}](${site.url}/writing/${a.slug}): ${a.meta.description}`),
    "",
    "## Notes",
    "- Client names are hidden on purpose. Work done with AI coding agents is labelled as such on each page.",
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
