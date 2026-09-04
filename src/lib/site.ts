export const SITE_NAME = "5cMenu";
export const SITE_TAGLINE = "Claremont Colleges dining halls in one place";
export const SITE_DESCRIPTION =
  "Live menus from McConnell, Malott, Collins, Hoch-Shanahan, Frary, and Frank. See what is being served, which hall, and which station.";

export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://127.0.0.1:43211";
}

export function pageUrl(path = "/") {
  return new URL(path, `${siteUrl()}/`).toString();
}
