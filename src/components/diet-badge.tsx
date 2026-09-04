import { Badge } from "@/components/ui/badge";
import type { DietTag } from "@/lib/types";

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
    <Badge
      variant="outline"
      className="h-4 rounded-md border-white/10 bg-transparent px-1.5 text-[10px] font-medium text-zinc-400"
    >
      {LABELS[tag]}
    </Badge>
  );
}
