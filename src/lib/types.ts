export type DietTag =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "halal"
  | "plant-based"
  | "mindful";

export type MealName =
  | "Breakfast"
  | "Brunch"
  | "Lunch"
  | "Dinner"
  | "Continuous"
  | "Late Night"
  | "Other";

export type HallId =
  | "mcconnell"
  | "malott"
  | "collins"
  | "hoch"
  | "frary"
  | "frank";

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  tags: DietTag[];
  allergens: string[];
  featured?: boolean;
};

export type Station = {
  id: string;
  name: string;
  extra?: boolean;
  items: MenuItem[];
};

export type Meal = {
  id: string;
  name: MealName;
  rawName: string;
  start?: string;
  end?: string;
  hoursLabel?: string;
  stations: Station[];
};

export type HallStatus = "ok" | "empty" | "error";

export type HallMenu = {
  hallId: HallId;
  date: string;
  status: HallStatus;
  error?: string;
  fetchedAt: string;
  sourceUrl: string;
  meals: Meal[];
};

export type MenusPayload = {
  date: string;
  timezone: string;
  fetchedAt: string;
  halls: HallMenu[];
};
