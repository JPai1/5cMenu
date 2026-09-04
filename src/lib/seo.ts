import { hallById } from "@/lib/halls";
import { formatCampusDate, todayOnCampus } from "@/lib/time";
import type { MenusPayload } from "@/lib/types";
import { SITE_DESCRIPTION, SITE_NAME, pageUrl } from "@/lib/site";

export function featuredDishNames(payload: MenusPayload, limit = 8) {
  const names: string[] = [];
  for (const hall of payload.halls) {
    for (const meal of hall.meals) {
      for (const station of meal.stations) {
        if (station.extra) continue;
        for (const item of station.items) {
          if (!item.name || names.includes(item.name)) continue;
          names.push(item.name);
          if (names.length >= limit) return names;
        }
      }
    }
  }
  return names;
}

export function seoTitle(date: string, today: string) {
  const when = date === today ? "today" : formatCampusDate(date, "long");
  return `${SITE_NAME} — Claremont dining menus for ${when}`;
}

export function seoDescription(payload: MenusPayload, date: string, today: string) {
  const when = date === today ? "today" : formatCampusDate(date, "long");
  const dishes = featuredDishNames(payload, 4);
  const halls =
    "McConnell, Malott, Collins, Hoch-Shanahan, Frary, and Frank";
  if (!dishes.length) {
    return `${SITE_NAME} live ${when} menus from ${halls}. See the dish, hall, and station.`;
  }
  return `${when} at the 5Cs: ${dishes.join(", ")}. Live menus from ${halls}.`;
}

function dietUrl(tags: string[]) {
  if (tags.includes("vegan")) return "https://schema.org/VeganDiet";
  if (tags.includes("vegetarian")) return "https://schema.org/VegetarianDiet";
  if (tags.includes("gluten-free")) return "https://schema.org/GlutenFreeDiet";
  return undefined;
}

export function menuPath(date: string, today = todayOnCampus()) {
  return date === today ? "/" : `/?date=${date}`;
}

export function menuJsonLd(payload: MenusPayload) {
  const today = todayOnCampus();
  const path = menuPath(payload.date, today);
  const url = pageUrl(path);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${pageUrl("/")}#website`,
        name: SITE_NAME,
        url: pageUrl("/"),
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        publisher: { "@id": `${pageUrl("/")}#org` },
      },
      {
        "@type": "Organization",
        "@id": `${pageUrl("/")}#org`,
        name: SITE_NAME,
        url: pageUrl("/"),
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "ItemList",
        name: `Claremont Colleges dining halls — ${formatCampusDate(payload.date, "long")}`,
        url,
        numberOfItems: payload.halls.length,
        itemListElement: payload.halls.map((hall, index) => {
          const meta = hallById(hall.hallId);
          return {
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Restaurant",
              name: meta.name,
              alternateName: `${meta.college} ${meta.shortName}`,
              url: pageUrl(path),
              sameAs: meta.sourceUrl,
              servesCuisine: "American",
              address: {
                "@type": "PostalAddress",
                streetAddress: meta.address,
                addressLocality: "Claremont",
                addressRegion: "CA",
                postalCode: "91711",
                addressCountry: "US",
              },
              hasMenu: {
                "@type": "Menu",
                name: `${meta.shortName} menu for ${payload.date}`,
                url,
                hasMenuSection: hall.meals.map((meal) => ({
                  "@type": "MenuSection",
                  name: meal.rawName,
                  hasMenuItem: meal.stations
                    .filter((station) => !station.extra)
                    .flatMap((station) =>
                      station.items.slice(0, 12).map((item) => ({
                        "@type": "MenuItem",
                        name: item.name,
                        description: item.description || undefined,
                        suitableForDiet: dietUrl(item.tags),
                      })),
                    ),
                })),
              },
            },
          };
        }),
      },
    ],
  };
}

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
