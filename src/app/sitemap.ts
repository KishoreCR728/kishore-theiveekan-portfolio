import type { MetadataRoute } from "next";
import { allCases } from "@/lib/cases";
import { articles } from "@/lib/content";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, priority: 1 },
    { url: `${site.url}/writing`, priority: 0.8 },
    { url: `${site.url}/lab`, priority: 0.6 },
    ...allCases().map((c) => ({ url: `${site.url}/work/${c.slug}`, priority: c.flagship ? 0.9 : 0.6 })),
    ...articles().map((a) => ({ url: `${site.url}/writing/${a.slug}`, lastModified: a.meta.date, priority: 0.8 })),
  ];
}
