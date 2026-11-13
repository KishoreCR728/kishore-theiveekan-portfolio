import type { MetadataRoute } from "next";
import { allCases } from "@/lib/cases";
import { articles } from "@/lib/content";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date().toISOString().slice(0, 10); // pages without their own date change with each release
  const latestPost = articles().map((a) => a.meta.date).sort().pop() ?? built;
  return [
    { url: site.url, lastModified: built, priority: 1 },
    { url: `${site.url}/writing`, lastModified: latestPost, priority: 0.8 },
    ...allCases().map((c) => ({ url: `${site.url}/work/${c.slug}`, lastModified: built, priority: c.flagship ? 0.9 : 0.6 })),
    ...articles().map((a) => ({ url: `${site.url}/writing/${a.slug}`, lastModified: a.meta.date, priority: 0.8 })),
  ];
}
