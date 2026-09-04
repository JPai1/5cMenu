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
import { useEffect, useMemo, useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MEAL_TABS: { id: MealName | "all"; label: string }[] = [
  { id: "all", label: "All meals" },
  { id: "Breakfast", label: "Breakfast" },
  { id: "Brunch", label: "Brunch" },
  { id: "Lunch", label: "Lunch" },
  { id: "Dinner", label: "Dinner" },
];

export function MenuBoard({ date, today }: { date: string; today: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [diets, setDiets] = useState<DietTag[]>([]);
  const [meal, setMeal] = useState<MealName | "all">("all");
  const nowMeal = currentMealHint();
  const [hallFilter, setHallFilter] = useState<HallId | "all">("all");
  const [initial, setInitial] = useState<MenusPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/menus?date=${date}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Menu request failed (${response.status})`);
        return response.json() as Promise<MenusPayload>;
      })
      .then((payload) => {
        if (cancelled) return;
        setInitial(payload);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : "Could not load menus.");
      });
    return () => {
      cancelled = true;
    };
  }, [date, reloadToken]);

  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addCampusDays(today, i - 1));
  }, [today]);

  const q = query.trim().toLowerCase();
  const visible = (initial?.halls ?? [])
    .filter((hall) => hallFilter === "all" || hall.hallId === hallFilter)
    .map((hall) => filterHall(hall, q, diets, meal));

  const shown = visible.filter(
    (hall) => hall.status !== "ok" || countItems(hall) > 0 || !q,
  );
  const totalItems = shown.reduce((sum, hall) => sum + countItems(hall), 0);
  const loading = !initial && !loadError;
  const stale = Boolean(initial && initial.date !== date);

  function goToDate(nextDate: string) {
    startTransition(() => {
      router.push(nextDate === todayOnCampus() ? "/" : `/?date=${nextDate}`);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 sm:px-6">
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
            <UtensilsCrossed className="size-4" />
            {formatCampusDate(initial?.date ?? date, "long")}
          </div>
        </div>
      </header>

      <div className="bg-background/90 sticky top-0 z-20 -mx-4 border-b px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map((chip) => {
            const selected = chip === date;
            return (
              <Button
                key={chip}
                size="sm"
                variant={selected ? "default" : "outline"}
                onClick={() => goToDate(chip)}
                disabled={pending || loading}
                className="shrink-0"
              >
                {dateChipLabel(chip, today)}
              </Button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dishes — birria, tofu scramble, pizza…"
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
          >
            {DIET_OPTIONS.map((option) => (
              <ToggleGroupItem key={option.id} value={option.id}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto">
          {MEAL_TABS.map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={meal === tab.id ? "secondary" : "ghost"}
              onClick={() => setMeal(tab.id)}
              className={cn("shrink-0", meal === tab.id && "bg-stone-200")}
            >
              {tab.label}
              {tab.id === nowMeal ? (
                <span className="text-muted-foreground ml-1 text-[0.65rem]">now</span>
              ) : null}
            </Button>
          ))}
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto">
          <Button
            size="xs"
            variant={hallFilter === "all" ? "default" : "outline"}
            onClick={() => setHallFilter("all")}
          >
            All halls
          </Button>
          {HALLS.map((hall) => (
            <Button
              key={hall.id}
              size="xs"
              variant={hallFilter === hall.id ? "default" : "outline"}
              onClick={() => setHallFilter(hall.id)}
              className="shrink-0"
            >
              <span
                className="mr-1.5 inline-block size-2 rounded-full"
                style={{ background: hall.accent }}
              />
              {hall.shortName}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground mt-4 text-sm">
        {loading || pending || stale
          ? "Loading menus from the dining sites…"
          : loadError
            ? loadError
            : `${totalItems} dishes across ${shown.filter((h) => countItems(h) > 0).length || shown.length} halls · refreshed from source sites about every 15 minutes`}
      </p>

      {loadError ? (
        <div className="border-border mt-6 rounded-2xl border border-dashed px-6 py-10 text-center">
          <p className="font-heading text-2xl">Menus didn’t load</p>
          <p className="text-muted-foreground mt-2 text-sm">{loadError}</p>
          <Button className="mt-4" onClick={() => setReloadToken((n) => n + 1)}>
            Retry
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "mt-4 grid gap-4 lg:grid-cols-2",
          (pending || stale) && "opacity-60",
        )}
      >
        {shown.map((hall) => (
          <HallCard key={hall.hallId} menu={hall} />
        ))}
      </div>

      {q && !loading && totalItems === 0 ? (
        <div className="border-border mt-8 rounded-2xl border border-dashed px-6 py-10 text-center">
          <p className="font-heading text-2xl">Nothing matched “{query.trim()}”</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Try another dish name, clear the diet filters, or switch meals.
          </p>
        </div>
      ) : null}

      <footer className="text-muted-foreground mt-12 border-t pt-6 text-xs leading-relaxed">
        5cMenu reads public menus from the official dining sites and does not
        replace them. Hours and dishes change; when something looks off, open
        the source link on that hall. Production only — there is no staging
        branch.
      </footer>
    </div>
  );
}
