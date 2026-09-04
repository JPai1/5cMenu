import { DietBadge } from "@/components/diet-badge";
import { Badge } from "@/components/ui/badge";
import { hallById } from "@/lib/halls";
import { countItems } from "@/lib/filters";
import type { HallMenu, MenuItem, Station } from "@/lib/types";
import { ExternalLink, MapPin, TriangleAlert } from "lucide-react";

function ItemRow({ item }: { item: MenuItem }) {
  return (
    <li className="border-border/70 border-b py-2 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground text-[0.95rem] leading-snug font-medium">
            {item.name}
            {item.featured ? (
              <span className="text-primary ml-2 text-[0.7rem] font-semibold tracking-wide uppercase">
                special
              </span>
            ) : null}
          </p>
          {item.description ? (
            <p className="text-muted-foreground mt-0.5 text-sm leading-snug">
              {item.description}
            </p>
          ) : null}
          {item.allergens.length ? (
            <p className="text-muted-foreground/80 mt-1 text-xs">
              Allergens: {item.allergens.join(", ")}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {item.calories ? (
            <span className="text-muted-foreground text-xs tabular-nums">
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
      <details className="group border-border/80 bg-muted/40 rounded-xl border px-3 py-2">
        <summary className="text-muted-foreground cursor-pointer list-none text-sm font-medium">
          <span className="group-open:hidden">Show {station.name}</span>
          <span className="hidden group-open:inline">{station.name}</span>
          <span className="ml-2 tabular-nums">({station.items.length})</span>
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
      <h4 className="text-primary mb-1 text-xs font-semibold tracking-[0.14em] uppercase">
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
    <article className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      <header className="px-4 pt-4 pb-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-white uppercase"
                style={{ background: hall.accent }}
              >
                {hall.collegeShort}
              </span>
              <h2 className="font-heading text-xl leading-none tracking-tight">
                {hall.shortName}
              </h2>
            </div>
            <p className="text-muted-foreground mt-1.5 text-sm">{hall.name}</p>
          </div>
          <a
            href={hall.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
          >
            Source
            <ExternalLink className="size-3" />
          </a>
        </div>
        <p className="text-muted-foreground mt-2 flex items-start gap-1.5 text-xs leading-snug">
          <MapPin className="mt-0.5 size-3 shrink-0" />
          <span>
            {hall.address}. {hall.hours}
          </span>
        </p>
      </header>

      {menu.status === "error" ? (
        <div className="border-border mx-4 mb-4 rounded-xl border border-dashed px-3 py-4 sm:mx-5">
          <p className="flex items-start gap-2 text-sm">
            <TriangleAlert className="text-destructive mt-0.5 size-4 shrink-0" />
            <span>
              Couldn’t load this hall right now.{" "}
              <a className="underline" href={hall.sourceUrl} target="_blank" rel="noreferrer">
                Open the official menu
              </a>
              {menu.error ? ` (${menu.error})` : ""}
            </span>
          </p>
        </div>
      ) : null}

      {menu.status === "empty" || (menu.status === "ok" && itemCount === 0) ? (
        <div className="text-muted-foreground mx-4 mb-4 rounded-xl bg-stone-100 px-3 py-4 text-sm sm:mx-5">
          No matching dishes for this meal and filter. The hall may be closed, or
          the source site has not posted this date yet.
        </div>
      ) : null}

      {menu.status === "ok" && itemCount > 0
        ? menu.meals.map((meal) => (
            <div key={meal.id} className="border-border border-t px-4 py-3 sm:px-5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="font-heading text-lg tracking-tight">{meal.rawName}</h3>
                {meal.hoursLabel ? (
                  <Badge variant="outline" className="text-muted-foreground font-normal">
                    {meal.hoursLabel}
                  </Badge>
                ) : null}
              </div>
              <div className="space-y-4">
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
