import { Badge } from "@/components/ui/badge";
import type { DietTag } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<DietTag, string> = {
  vegan: "border-emerald-700/20 bg-emerald-100 text-emerald-900",
  vegetarian: "border-lime-700/20 bg-lime-100 text-lime-950",
  "gluten-free": "border-amber-700/20 bg-amber-100 text-amber-950",
  halal: "border-teal-700/20 bg-teal-100 text-teal-950",
  "plant-based": "border-green-700/20 bg-green-100 text-green-950",
  mindful: "border-sky-700/20 bg-sky-100 text-sky-950",
};

const LABELS: Record<DietTag, string> = {
  vegan: "Vegan",
  vegetarian: "Veg",
  "gluten-free": "GF",
  halal: "Halal",
  "plant-based": "Plant",
  mindful: "Mindful",
};

export function DietBadge({ tag }: { tag: DietTag }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STYLES[tag])}>
      {LABELS[tag]}
    </Badge>
  );
}
