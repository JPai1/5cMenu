# 5cMenu

One site for every Claremont Colleges dining hall. 5cMenu pulls today’s (and nearby days’) menus from the official sources, then shows the dishes, the hall, and the station so you can decide where to eat without opening six tabs.

Halls:

- **McConnell** — Pitzer ([cafebonappetit.com](https://pitzer.cafebonappetit.com/))
- **Malott** — Scripps ([cafebonappetit.com](https://scripps.cafebonappetit.com/))
- **Collins** — CMC ([collins-cmc.cafebonappetit.com](https://collins-cmc.cafebonappetit.com/cafe/collins/))
- **Hoch-Shanahan** — Harvey Mudd ([sodexomyway.com](https://hmc.sodexomyway.com/en-us/locations/hoch-shanahan-dining-commons))
- **Frary** — Pomona ([pomona.edu](https://www.pomona.edu/administration/dining/menus/frary))
- **Frank** — Pomona ([pomona.edu](https://www.pomona.edu/administration/dining/menus/frank))

Dates use `America/Los_Angeles`. Menus are cached for about 15 minutes.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43211](http://127.0.0.1:43211) if you start the server with `npm run dev -- --port 43211`, or the port Next prints.

JSON feed:

```
GET /api/menus
GET /api/menus?date=2026-09-04
```

Crawlers get the full menu HTML (not a client-only fetch), plus:

- `/robots.txt` — allow the site, disallow `/api/`
- `/sitemap.xml` — today and nearby dates
- `/opengraph-image` and `/twitter-image`
- JSON-LD `Restaurant` / `Menu` markup for each hall

## Deploy on Vercel (production only)

This repo is meant to ship straight to production from `main`. There is no staging branch.

1. Create a GitHub repository named `5cMenu`.
2. Import that repo in Vercel.
3. Set the **Production Branch** to `main`.
4. Deploy. `vercel.json` skips builds on any branch that is not `main`, so preview/staging deploys are not created.

No environment variables are required. The app reads public menu pages and public JSON the colleges already expose.

## How the data is read

- Pitzer, Scripps, and CMC: structured `Bamco` menu JSON embedded in the Café Bon Appétit pages.
- Harvey Mudd: Sodexo’s public menu API (`api-prd.sodexomyway.net`), the same endpoint the official location page uses.
- Pomona Frary and Frank: `https://api.pomona.edu/eatec/Frary.json` and `Frank.json` (Eatec JSONP used by the college menu pages).
