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
  todayOnCampus,
} from "@/lib/time";
import type { DietTag, HallId, MealName, MenusPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";

const MEAL_TABS: { id: MealName | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Breakfast", label: "Breakfast" },
  { id: "Brunch", label: "Brunch" },
  { id: "Lunch", label: "Lunch" },
  { id: "Dinner", label: "Dinner" },
];

function QuietButton({
  pressed,
  onClick,
  children,
  disabled,
  className,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={disabled}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "h-7 shrink-0 rounded-md px-2 text-[13px] font-medium hover:bg-transparent",
        pressed
          ? "text-white hover:text-white"
          : "text-zinc-400 hover:text-zinc-100",
        className,
      )}
    >
      {children}
    </Button>
  );
}

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
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col px-4 pb-16 sm:px-8">
      <a
        href="#menus"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:border focus:border-white/10 focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-black"
      >
        Skip to menus
      </a>

      <div className="bg-background/85 sticky top-0 z-20 -mx-4 border-b border-white/10 px-4 py-2.5 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[15px] leading-none font-medium tracking-tight">
            5C.
          </h1>
          <div className="relative w-36 min-w-0 sm:w-44">
            <Search
              className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label="Search dishes"
              className="h-8 border-white/10 bg-transparent pl-7 text-sm dark:bg-transparent"
            />
          </div>
        </div>

        <div
          className="mt-2 flex gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="navigation"
          aria-label="Menu date"
        >
          {dates.map((chip) => (
            <QuietButton
              key={chip}
              pressed={chip === date}
              onClick={() => goToDate(chip)}
              disabled={pending}
            >
              {dateChipLabel(chip, today)}
            </QuietButton>
          ))}
        </div>

        <div className="mt-0.5 flex items-center gap-2">
          <div
            className="flex min-w-0 flex-1 gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Meal"
          >
            {MEAL_TABS.map((tab) => (
              <QuietButton
                key={tab.id}
                pressed={meal === tab.id}
                onClick={() => setMeal(tab.id)}
              >
                {tab.label}
                {tab.id === nowMeal ? (
                  <span className="ml-1 text-[10px] font-normal text-zinc-500" aria-hidden>
                    now
                  </span>
                ) : null}
              </QuietButton>
            ))}
          </div>
          <details className="relative shrink-0">
            <summary className="cursor-pointer list-none text-[13px] font-medium text-zinc-400 hover:text-zinc-100 [&::-webkit-details-marker]:hidden">
              Diet
              {diets.length ? (
                <span className="text-zinc-500"> · {diets.length}</span>
              ) : null}
            </summary>
            <ToggleGroup
              type="multiple"
              value={diets}
              onValueChange={(value) => setDiets(value as DietTag[])}
              variant="outline"
              size="sm"
              className="absolute top-full right-0 z-30 mt-2 max-w-[min(100vw-2rem,20rem)] flex-wrap justify-end border border-white/10 bg-[#0d0d0d] p-1"
              aria-label="Dietary filters"
            >
              {DIET_OPTIONS.map((option) => (
                <ToggleGroupItem key={option.id} value={option.id}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </details>
        </div>

        <div
          className="mt-0.5 flex gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Dining hall"
        >
          <QuietButton
            pressed={hallFilter === "all"}
            onClick={() => setHallFilter("all")}
          >
            All
          </QuietButton>
          {HALLS.map((hall) => (
            <QuietButton
              key={hall.id}
              pressed={hallFilter === hall.id}
              onClick={() => setHallFilter(hall.id)}
            >
              <span
                className="mr-1.5 inline-block size-1.5 rounded-full"
                style={{ background: hall.accent }}
                aria-hidden
              />
              {hall.shortName}
            </QuietButton>
          ))}
        </div>
      </div>

      <div
        id="menus"
        className={cn(
          "mt-5 grid gap-4 lg:grid-cols-2 lg:gap-5",
          pending && "opacity-60",
        )}
      >
        {shown.map((hall) => (
          <HallCard key={hall.hallId} menu={hall} />
        ))}
      </div>

      {q && totalItems === 0 ? (
        <p className="mt-10 text-sm text-zinc-400">
          Nothing matched “{query.trim()}”.
        </p>
      ) : null}

      <footer className="mt-16 text-[11px] text-zinc-500">
        Official 5C dining menus, in one place.
      </footer>
    </div>
  );
}
