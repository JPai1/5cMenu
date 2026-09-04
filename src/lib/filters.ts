import type { DietTag, HallMenu, MealName, MenuItem } from "@/lib/types";

export const DIET_OPTIONS: { id: DietTag; label: string }[] = [
  { id: "vegan", label: "Vegan" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "halal", label: "Halal" },
  { id: "plant-based", label: "Plant-based" },
];

export function itemMatches(
  item: MenuItem,
  query: string,
  diets: DietTag[],
) {
  if (diets.length && !diets.every((diet) => item.tags.includes(diet))) {
    return false;
  }
  if (!query) return true;
  const hay = `${item.name} ${item.description ?? ""}`.toLowerCase();
  return hay.includes(query);
}

export function filterHall(
  hall: HallMenu,
  query: string,
  diets: DietTag[],
  meal: MealName | "all",
): HallMenu {
  const meals = hall.meals
    .filter((entry) => meal === "all" || entry.name === meal)
    .map((entry) => ({
      ...entry,
      stations: entry.stations
        .map((station) => ({
          ...station,
          items: station.items.filter((item) => itemMatches(item, query, diets)),
        }))
        .filter((station) => station.items.length),
    }))
    .filter((entry) => entry.stations.length);

  return { ...hall, meals };
}

export function countItems(hall: HallMenu, includeExtra = true) {
  return hall.meals.reduce(
    (sum, meal) =>
      sum +
      meal.stations.reduce((inner, station) => {
        if (!includeExtra && station.extra) return inner;
        return inner + station.items.length;
      }, 0),
    0,
  );
}
