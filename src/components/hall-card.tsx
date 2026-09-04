import { DietBadge } from "@/components/diet-badge";
import { hallById } from "@/lib/halls";
import { countItems } from "@/lib/filters";
import type { HallMenu, MenuItem, Station } from "@/lib/types";

function usefulDescription(item: MenuItem) {
  const description = item.description?.trim();
  if (!description) return null;
  if (description.toLowerCase() === item.name.trim().toLowerCase()) return null;
  if (description.length > 72) return null;
  return description;
}

function ItemRow({ item }: { item: MenuItem }) {
  const description = usefulDescription(item);

  return (
    <li className="border-b border-white/10 py-2.5 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="text-[0.95rem] leading-snug font-medium text-white">
            {item.name}
            {item.featured ? (
              <span className="ml-2 text-[0.65rem] font-medium tracking-wide text-zinc-500 uppercase">
                special
              </span>
            ) : null}
          </h5>
          {description ? (
            <p className="mt-0.5 text-sm leading-snug text-zinc-500">
              {description}
            </p>
          ) : null}
          {item.allergens.length ? (
            <p className="mt-1 text-xs text-zinc-600">
              {item.allergens.join(", ")}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {item.calories ? (
            <span className="text-xs text-zinc-500 tabular-nums">
              {item.calories} cal
            </span>
          ) : null}
          {item.tags.length ? (
            <div className="flex flex-wrap justify-end gap-1">
              {item.tags.map((tag) => (
                <DietBadge key={tag} tag={tag} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function StationBlock({ station }: { station: Station }) {
  if (station.extra) {
    return (
      <details className="group">
        <summary className="cursor-pointer list-none text-sm text-zinc-500 hover:text-zinc-300 [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">+ {station.name}</span>
          <span className="hidden group-open:inline">{station.name}</span>
          <span className="ml-1.5 tabular-nums">({station.items.length})</span>
        </summary>
        <ul className="mt-1">
          {station.items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </ul>
      </details>
    );
  }

  return (
    <section>
      <h4 className="mb-1 text-[11px] font-medium tracking-[0.16em] text-zinc-500 uppercase">
        {station.name}
      </h4>
      <ul>
        {station.items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

export function HallCard({ menu }: { menu: HallMenu }) {
  const hall = hallById(menu.hallId);
  const itemCount = countItems(menu);

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-transparent">
      <header className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ background: hall.accent }}
            aria-hidden
          />
          <h2 className="truncate text-base leading-none font-medium tracking-tight">
            {hall.shortName}
          </h2>
        </div>
        <a
          href={hall.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-sm text-zinc-500 hover:text-white"
          aria-label={`Official ${hall.shortName} menu`}
        >
          ↗
        </a>
      </header>

      {menu.status === "error" ? (
        <p className="px-4 pb-4 text-sm text-zinc-400 sm:px-5">
          Couldn’t load this hall.{" "}
          <a
            className="text-white underline-offset-4 hover:underline"
            href={hall.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Official menu ↗
          </a>
        </p>
      ) : null}

      {menu.status === "empty" || (menu.status === "ok" && itemCount === 0) ? (
        <p className="px-4 pb-4 text-sm text-zinc-400 sm:px-5">
          Nothing posted for this filter.{" "}
          <a
            className="text-white underline-offset-4 hover:underline"
            href={hall.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Official menu ↗
          </a>
        </p>
      ) : null}

      {menu.status === "ok" && itemCount > 0
        ? menu.meals.map((meal) => (
            <div key={meal.id} className="border-t border-white/10 px-4 py-3.5 sm:px-5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="text-[15px] font-medium tracking-tight">
                  {meal.rawName}
                </h3>
                {meal.hoursLabel ? (
                  <span className="text-xs text-zinc-500">{meal.hoursLabel}</span>
                ) : null}
              </div>
              <div className="space-y-5">
                {meal.stations.map((station) => (
                  <StationBlock key={station.id} station={station} />
                ))}
              </div>
            </div>
          ))
        : null}
    </article>
  );
}
