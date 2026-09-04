"use client";

import { HallCard } from "@/components/hall-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DIET_OPTIONS, countItems, filterHall } from "@/lib/filters";
import { HALLS } from "@/lib/halls";
import {
  addCampusDays,
  currentMealHint,
  dateChipLabel,
  formatCampusDate,
  todayOnCampus,
} from "@/lib/time";
import type { DietTag, HallId, MealName, MenusPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Search, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

const MEAL_TABS: { id: MealName | "all"; label: string }[] = [
  { id: "all", label: "All meals" },
  { id: "Breakfast", label: "Breakfast" },
  { id: "Brunch", label: "Brunch" },
  { id: "Lunch", label: "Lunch" },
  { id: "Dinner", label: "Dinner" },
];

export function MenuBoard({
  initial,
  date,
  today,
}: {
  initial: MenusPayload;
  date: string;
  today: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [diets, setDiets] = useState<DietTag[]>([]);
  const [meal, setMeal] = useState<MealName | "all">("all");
  const nowMeal = currentMealHint();
  const [hallFilter, setHallFilter] = useState<HallId | "all">("all");

  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addCampusDays(today, i - 1));
  }, [today]);

  const q = query.trim().toLowerCase();
  const visible = initial.halls
    .filter((hall) => hallFilter === "all" || hall.hallId === hallFilter)
    .map((hall) => filterHall(hall, q, diets, meal));

  const shown = visible.filter(
    (hall) => hall.status !== "ok" || countItems(hall) > 0 || !q,
  );
  const totalItems = shown.reduce((sum, hall) => sum + countItems(hall, false), 0);

  function goToDate(nextDate: string) {
    startTransition(() => {
      router.push(nextDate === todayOnCampus() ? "/" : `/?date=${nextDate}`);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 sm:px-6">
      <a
        href="#menus"
        className="bg-primary text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:px-3 focus:py-2"
      >
        Skip to menus
      </a>
      <header className="pt-6 pb-5 sm:pt-10">
        <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
          Claremont Colleges
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-4xl tracking-tight sm:text-5xl">5cMenu</h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed sm:text-base">
              Every dining hall, every station, pulled live from the official
              Pitzer, Scripps, CMC, Harvey Mudd, and Pomona menus.
            </p>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <UtensilsCrossed className="size-4" aria-hidden />
            <time dateTime={initial.date}>{formatCampusDate(initial.date, "long")}</time>
          </div>
        </div>
      </header>

      <div className="bg-background/90 sticky top-0 z-20 -mx-4 border-b px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1" role="navigation" aria-label="Menu date">
          {dates.map((chip) => {
            const selected = chip === date;
            return (
              <Button
                key={chip}
                size="sm"
                variant={selected ? "default" : "outline"}
                onClick={() => goToDate(chip)}
                disabled={pending}
                aria-pressed={selected}
                className="shrink-0"
              >
                {dateChipLabel(chip, today)}
              </Button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" aria-hidden />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dishes — birria, tofu scramble, pizza…"
              aria-label="Search dishes"
              className="h-9 bg-white pl-8"
            />
          </div>
          <ToggleGroup
            type="multiple"
            value={diets}
            onValueChange={(value) => setDiets(value as DietTag[])}
            variant="outline"
            size="sm"
            className="flex-wrap justify-start"
            aria-label="Dietary filters"
          >
            {DIET_OPTIONS.map((option) => (
              <ToggleGroupItem key={option.id} value={option.id}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Meal">
          {MEAL_TABS.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={meal === tab.id ? "secondary" : "ghost"}
              onClick={() => setMeal(tab.id)}
              aria-pressed={meal === tab.id}
              className={cn("shrink-0", meal === tab.id && "bg-stone-200")}
            >
              {tab.label}
              {tab.id === nowMeal ? (
                <span className="text-muted-foreground ml-1 text-[0.65rem]">now</span>
              ) : null}
            </Button>
          ))}
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto" aria-label="Dining hall">
          <Button
            size="xs"
            variant={hallFilter === "all" ? "default" : "outline"}
            onClick={() => setHallFilter("all")}
            aria-pressed={hallFilter === "all"}
          >
            All halls
          </Button>
          {HALLS.map((hall) => (
            <Button
              key={hall.id}
              size="xs"
              variant={hallFilter === hall.id ? "default" : "outline"}
              onClick={() => setHallFilter(hall.id)}
              aria-pressed={hallFilter === hall.id}
              className="shrink-0"
            >
              <span
                className="mr-1.5 inline-block size-2 rounded-full"
                style={{ background: hall.accent }}
                aria-hidden
              />
              {hall.shortName}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground mt-4 text-sm">
        {pending
          ? "Loading menus from the dining sites…"
          : `${totalItems} dishes across ${shown.filter((h) => countItems(h) > 0).length || shown.length} halls · refreshed from source sites about every 15 minutes`}
      </p>

      <div
        id="menus"
        className={cn(
          "mt-4 grid gap-4 lg:grid-cols-2",
          pending && "opacity-60",
        )}
      >
        {shown.map((hall) => (
          <HallCard key={hall.hallId} menu={hall} />
        ))}
      </div>

      {q && totalItems === 0 ? (
        <div className="border-border mt-8 rounded-2xl border border-dashed px-6 py-10 text-center">
          <p className="font-heading text-2xl">Nothing matched “{query.trim()}”</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Try another dish name, clear the diet filters, or switch meals.
          </p>
        </div>
      ) : null}

      <footer className="text-muted-foreground mt-12 border-t pt-6 text-xs leading-relaxed">
        <p>
          5cMenu aggregates Claremont Colleges dining: McConnell at Pitzer,
          Malott at Scripps, Collins at CMC, Hoch-Shanahan at Harvey Mudd, and
          Frary and Frank at Pomona. Menus are read from the official public
          pages and do not replace them.
        </p>
        <p className="mt-2">
          Hours and dishes change. When something looks off, open the source
          link on that hall. Production only — there is no staging branch.
        </p>
      </footer>
    </div>
  );
}
