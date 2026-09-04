import { fetchText } from "@/lib/http";
import type { HallConfig } from "@/lib/halls";
import {
  cleanText,
  dietFromLabel,
  isExtraStation,
  normalizeMealName,
  parseCalories,
  titleCase,
  uniqueStrings,
  uniqueTags,
} from "@/lib/normalize";
import { todayOnCampus } from "@/lib/time";
import type { DietTag, HallMenu, Meal, MenuItem, Station } from "@/lib/types";
import { extractBalanced } from "@/lib/sources/js-extract";

type BamcoItem = {
  id?: string;
  label?: string;
  description?: string;
  special?: number | string;
  cor_icon?: Record<string, string> | unknown[];
  nutrition?: { kcal?: string };
  station?: string;
};

type BamcoStation = {
  id?: string;
  label?: string;
  items?: string[];
};

type BamcoDaypart = {
  id?: string;
  label?: string;
  starttime?: string;
  endtime?: string;
  time_formatted?: string;
  stations?: BamcoStation[];
};

function bamcoUrls(hall: HallConfig, date: string): string[] {
  if (hall.source.kind !== "bamco") return [];
  const { origin, slug, frontPage } = hall.source;
  const urls: string[] = [];
  if (slug) {
    urls.push(`${origin}/cafe/${slug}/${date}/`);
  }
  if (frontPage && date === todayOnCampus()) {
    urls.unshift(`${origin}/`);
  }
  return urls;
}

function parseIcons(html: string): Record<string, { label?: string }> {
  const raw = extractBalanced(html, "Bamco.cor_icons =");
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, { label?: string }>;
  } catch {
    return {};
  }
}

function itemTags(
  item: BamcoItem,
  icons: Record<string, { label?: string } | string>,
): DietTag[] {
  const tags: DietTag[] = [];
  const cor = item.cor_icon;
  if (cor && !Array.isArray(cor)) {
    for (const key of Object.keys(cor)) {
      const icon = icons[key];
      const label =
        typeof icon === "string" ? icon : icon?.label || String(cor[key] ?? key);
      const tag = dietFromLabel(label);
      if (tag) tags.push(tag);
    }
  }
  return uniqueTags(tags);
}

function parseMenu(html: string, hall: HallConfig, date: string): HallMenu {
  const itemsRaw = extractBalanced(html, "Bamco.menu_items =");
  if (!itemsRaw) {
    throw new Error("Menu data was not embedded on the dining site");
  }
  const items = JSON.parse(itemsRaw) as Record<string, BamcoItem>;
  const icons = parseIcons(html) as Record<string, { label?: string }>;

  const dayparts: BamcoDaypart[] = [];
  const daypartMarker = /Bamco\.dayparts\[[^\]]+\]\s*=/g;
  let match: RegExpExecArray | null;
  while ((match = daypartMarker.exec(html))) {
    const raw = extractBalanced(html.slice(match.index), match[0]);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as BamcoDaypart;
      if (parsed && Array.isArray(parsed.stations)) dayparts.push(parsed);
    } catch {
      // skip malformed daypart blobs
    }
  }

  const meals: Meal[] = [];
  for (const part of dayparts) {
    const stations: Station[] = [];
    for (const station of part.stations ?? []) {
      const stationName = titleCase(station.label || "Station");
      const menuItems: MenuItem[] = [];
      for (const id of station.items ?? []) {
        const item = items[id];
        const name = cleanText(item?.label);
        if (!item || !name) continue;
        menuItems.push({
          id: String(item.id ?? id),
          name,
          description: cleanText(item.description),
          calories: parseCalories(item.nutrition?.kcal),
          tags: itemTags(item, icons),
          allergens: uniqueStrings([]),
          featured: Number(item.special) === 1,
        });
      }
      if (!menuItems.length) continue;
      menuItems.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
      stations.push({
        id: String(station.id ?? stationName),
        name: stationName,
        extra: isExtraStation(stationName),
        items: menuItems,
      });
    }
    if (!stations.length) continue;
    const rawName = part.label || "Menu";
    meals.push({
      id: String(part.id ?? rawName),
      name: normalizeMealName(rawName),
      rawName,
      start: part.starttime,
      end: part.endtime,
      hoursLabel: part.time_formatted,
      stations,
    });
  }

  return {
    hallId: hall.id,
    date,
    status: meals.length ? "ok" : "empty",
    fetchedAt: new Date().toISOString(),
    sourceUrl: hall.sourceUrl,
    meals,
  };
}

export async function fetchBamcoMenu(hall: HallConfig, date: string): Promise<HallMenu> {
  const urls = bamcoUrls(hall, date);
  if (!urls.length) {
    return {
      hallId: hall.id,
      date,
      status: "error",
      error: "This hall is missing a menu source URL.",
      fetchedAt: new Date().toISOString(),
      sourceUrl: hall.sourceUrl,
      meals: [],
    };
  }

  let lastError = "Could not load this menu.";
  for (const url of urls) {
    try {
      const html = await fetchText(url);
      return parseMenu(html, hall, date);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  const today = todayOnCampus();
  const hint =
    hall.source.kind === "bamco" && hall.source.frontPage && date !== today
      ? " Pitzer only publishes McConnell’s dining-hall menu on today’s homepage, so other dates may be unavailable."
      : "";

  return {
    hallId: hall.id,
    date,
    status: "error",
    error: `${lastError}.${hint}`.trim(),
    fetchedAt: new Date().toISOString(),
    sourceUrl: hall.sourceUrl,
    meals: [],
  };
}
