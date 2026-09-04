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
import type { DietTag, HallMenu, Meal, MenuItem, Station } from "@/lib/types";

type EatecFlag = { "@id"?: string; "#text"?: string };
type EatecRecipe = {
  "@id"?: string;
  "@category"?: string;
  "@description"?: string;
  "@shortName"?: string;
  "@displayonwebsite"?: string;
  "@nutrients"?: string;
  allergens?: { allergen?: EatecFlag[] | EatecFlag };
  dietaryChoices?: { dietaryChoice?: EatecFlag[] | EatecFlag };
};

type EatecMenu = {
  "@servedate"?: string;
  "@mealperiodname"?: string;
  recipes?: { recipe?: EatecRecipe[] | EatecRecipe };
};

function unwrap<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseJsonp(text: string): EatecMenu[] {
  const start = text.indexOf("(");
  const end = text.lastIndexOf(")");
  if (start < 0 || end <= start) throw new Error("Pomona menu JSONP was empty");
  const payload = JSON.parse(text.slice(start + 1, end)) as {
    EatecExchange?: { menu?: EatecMenu[] };
  };
  return payload.EatecExchange?.menu ?? [];
}

function yesFlags(flags: EatecFlag[] | EatecFlag | undefined) {
  return unwrap(flags).filter((flag) => /^yes$/i.test(flag["#text"] ?? ""));
}

function recipeTags(recipe: EatecRecipe): DietTag[] {
  const tags: DietTag[] = [];
  for (const flag of yesFlags(recipe.dietaryChoices?.dietaryChoice)) {
    const tag = dietFromLabel(flag["@id"] ?? "");
    if (tag) tags.push(tag);
  }
  return uniqueTags(tags);
}

function recipeAllergens(recipe: EatecRecipe): string[] {
  return uniqueStrings(yesFlags(recipe.allergens?.allergen).map((flag) => flag["@id"] ?? ""));
}

export async function fetchPomonaMenu(hall: HallConfig, date: string): Promise<HallMenu> {
  if (hall.source.kind !== "pomona") {
    throw new Error("Hall is not a Pomona source");
  }
  const compact = date.replaceAll("-", "");
  const text = await fetchText(hall.source.jsonUrl);
  const menus = parseJsonp(text).filter((menu) => menu["@servedate"] === compact);

  const mealsByName = new Map<string, Map<string, MenuItem[]>>();
  for (const menu of menus) {
    const mealName = menu["@mealperiodname"] || "Menu";
    const stationMap = mealsByName.get(mealName) ?? new Map<string, MenuItem[]>();
    for (const recipe of unwrap(menu.recipes?.recipe)) {
      if (recipe["@displayonwebsite"] && !/^yes$/i.test(recipe["@displayonwebsite"])) {
        continue;
      }
      const name = cleanText(recipe["@description"] || recipe["@shortName"]);
      if (!name) continue;
      const station = titleCase(recipe["@category"] || "Station");
      const items = stationMap.get(station) ?? [];
      const id = String(recipe["@id"] ?? `${station}-${name}`);
      if (items.some((item) => item.id === id || item.name === name)) continue;
      items.push({
        id,
        name,
        calories: parseCalories(recipe["@nutrients"]),
        tags: recipeTags(recipe),
        allergens: recipeAllergens(recipe),
      });
      stationMap.set(station, items);
    }
    mealsByName.set(mealName, stationMap);
  }

  const meals: Meal[] = [];
  for (const [rawName, stationMap] of mealsByName) {
    const stations: Station[] = [];
    for (const [name, items] of stationMap) {
      if (!items.length) continue;
      stations.push({
        id: name,
        name,
        extra: isExtraStation(name),
        items,
      });
    }
    if (!stations.length) continue;
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
