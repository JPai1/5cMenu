import type { DietTag, MealName } from "@/lib/types";

export function titleCase(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/^@+/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/(^|[\s/])([a-z])/g, (_, edge: string, ch: string) => edge + ch.toUpperCase());
}

export function cleanText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s*\/\s*description\s*$/i, "")
    .replace(/\s*[-–]\s*description(?: only)?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return text || undefined;
}

export function parseCalories(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value !== "string") return undefined;
  const match = value.match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

export function normalizeMealName(raw: string): MealName {
  const value = raw.toLowerCase();
  if (value.includes("brunch")) return "Brunch";
  if (value.includes("breakfast") || value.includes("continental")) {
    return "Breakfast";
  }
  if (value.includes("lunch")) return "Lunch";
  if (value.includes("dinner")) return "Dinner";
  if (value.includes("continuous") || value.includes("snack")) {
    return "Continuous";
  }
  if (value.includes("late")) return "Late Night";
  return "Other";
}

export function isExtraStation(name: string) {
  return /condiment|beverage|cereal|topping|breads?|bagel|spread|bar extras|miscellaneous|always|salad bar|juice|smoothie|deli|build your own sandwich|grill bread|pasta express|breakfast bar/i.test(
    name,
  );
}

export function dietFromLabel(label: string): DietTag | null {
  const value = label.toLowerCase();
  if (value.includes("vegan")) return "vegan";
  if (value.includes("vegetarian")) return "vegetarian";
  if (value.includes("gluten")) return "gluten-free";
  if (value.includes("halal")) return "halal";
  if (value.includes("plant")) return "plant-based";
  if (value.includes("mindful")) return "mindful";
  return null;
}

export function uniqueTags(tags: DietTag[]): DietTag[] {
  return [...new Set(tags)];
}

export function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.trim();
    if (!key) continue;
    const lower = key.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    out.push(key);
  }
  return out;
}
