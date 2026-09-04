import type { MetadataRoute } from "next";
import { pageUrl } from "@/lib/site";
import { addCampusDays, todayOnCampus } from "@/lib/time";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = todayOnCampus();
  const dates = Array.from({ length: 7 }, (_, i) => addCampusDays(today, i - 1));

  return [
    {
      url: pageUrl("/"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...dates
      .filter((date) => date !== today)
      .map((date) => ({
        url: pageUrl(`/?date=${date}`),
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.7,
      })),
  ];
}
