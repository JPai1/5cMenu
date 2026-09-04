import { unstable_cache } from "next/cache";
import { HALLS, type HallConfig } from "@/lib/halls";
import { fetchBamcoMenu } from "@/lib/sources/bamco";
import { fetchPomonaMenu } from "@/lib/sources/pomona";
import { fetchSodexoMenu } from "@/lib/sources/sodexo";
import { CAMPUS_TZ, isValidDate, todayOnCampus } from "@/lib/time";
import type { HallMenu, MenusPayload } from "@/lib/types";

async function fetchHall(hall: HallConfig, date: string): Promise<HallMenu> {
  try {
    if (hall.source.kind === "bamco") return await fetchBamcoMenu(hall, date);
    if (hall.source.kind === "pomona") return await fetchPomonaMenu(hall, date);
    return await fetchSodexoMenu(hall, date);
  } catch (error) {
    return {
      hallId: hall.id,
      date,
      status: "error",
      error: error instanceof Error ? error.message : "Could not load this menu.",
      fetchedAt: new Date().toISOString(),
      sourceUrl: hall.sourceUrl,
      meals: [],
    };
  }
}

async function loadMenus(date: string): Promise<MenusPayload> {
  const halls = await Promise.all(HALLS.map((hall) => fetchHall(hall, date)));
  return {
    date,
    timezone: CAMPUS_TZ,
    fetchedAt: new Date().toISOString(),
    halls,
  };
}

export function resolveMenuDate(raw?: string | string[] | null) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return isValidDate(value) ? value : todayOnCampus();
}

export async function getMenus(date: string): Promise<MenusPayload> {
  return unstable_cache(() => loadMenus(date), ["5c-menus", date], {
    revalidate: 900,
    tags: [`menus-${date}`],
  })();
}
