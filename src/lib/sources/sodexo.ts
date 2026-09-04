import { fetchJson } from "@/lib/http";
import type { HallConfig } from "@/lib/halls";
import {
  cleanText,
  isExtraStation,
  normalizeMealName,
  parseCalories,
  titleCase,
  uniqueStrings,
  uniqueTags,
} from "@/lib/normalize";
import type { DietTag, HallMenu, Meal, MenuItem, Station } from "@/lib/types";

const SODEXO_API = "https://api-prd.sodexomyway.net/v0.2";
/** Public key embedded in hmc.sodexomyway.com — same one the official menu page uses. */
const SODEXO_API_KEY = "68717828-b754-420d-9488-4c37cb7d7ef7";

type SodexoAllergen = { name?: string; allergen?: string; contains?: string };
type SodexoItem = {
  menuItemId?: number;
  formalName?: string;
  description?: string | null;
  course?: string;
  isVegan?: boolean;
  isVegetarian?: boolean;
  isPlantBased?: boolean;
  isMindful?: boolean;
  calories?: string | number;
  allergens?: SodexoAllergen[];
};
type SodexoGroup = { name?: string; sortOrder?: number; items?: SodexoItem[] };
type SodexoMeal = { name?: string; groups?: SodexoGroup[] };

function itemTags(item: SodexoItem): DietTag[] {
  const tags: DietTag[] = [];
  if (item.isVegan) tags.push("vegan");
  if (item.isVegetarian) tags.push("vegetarian");
  if (item.isPlantBased) tags.push("plant-based");
  if (item.isMindful) tags.push("mindful");
  return uniqueTags(tags);
}

export async function fetchSodexoMenu(hall: HallConfig, date: string): Promise<HallMenu> {
  if (hall.source.kind !== "sodexo") {
    throw new Error("Hall is not a Sodexo source");
  }
  const url = `${SODEXO_API}/data/menu/${hall.source.locationId}/${hall.source.menuId}?date=${date}`;
  const mealsJson = await fetchJson<SodexoMeal[]>(url, {
    headers: {
      "API-Key": SODEXO_API_KEY,
      "Content-Type": "application/json",
    },
  });

  const meals: Meal[] = [];
  for (const meal of mealsJson ?? []) {
    const stations: Station[] = [];
    for (const group of meal.groups ?? []) {
      const stationName = titleCase(group.name || group.items?.[0]?.course || "Station");
      const items: MenuItem[] = [];
      for (const item of group.items ?? []) {
        const name = cleanText(item.formalName);
        if (!name) continue;
        items.push({
          id: String(item.menuItemId ?? `${stationName}-${name}`),
          name,
          description: cleanText(item.description ?? undefined),
          calories: parseCalories(item.calories),
          tags: itemTags(item),
          allergens: uniqueStrings(
            (item.allergens ?? [])
              .filter((a) => a.contains === "true")
              .map((a) => a.name || a.allergen || ""),
          ),
        });
      }
      if (!items.length) continue;
      stations.push({
        id: stationName,
        name: stationName,
        extra: isExtraStation(stationName),
        items,
      });
    }
    if (!stations.length) continue;
    const rawName = meal.name || "Menu";
    meals.push({
      id: rawName,
      name: normalizeMealName(rawName),
      rawName,
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
