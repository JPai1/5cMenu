import type { HallId } from "@/lib/types";

export type BamcoConfig = {
  kind: "bamco";
  origin: string;
  slug?: string;
  frontPage?: boolean;
};

export type PomonaConfig = {
  kind: "pomona";
  jsonUrl: string;
};

export type SodexoConfig = {
  kind: "sodexo";
  locationId: string;
  menuId: string;
};

export type HallConfig = {
  id: HallId;
  name: string;
  shortName: string;
  college: string;
  collegeShort: string;
  sourceUrl: string;
  address: string;
  accent: string;
  hours: string;
  source: BamcoConfig | PomonaConfig | SodexoConfig;
};

export const HALLS: HallConfig[] = [
  {
    id: "mcconnell",
    name: "McConnell Dining Hall",
    shortName: "McConnell",
    college: "Pitzer",
    collegeShort: "PZ",
    sourceUrl: "https://pitzer.cafebonappetit.com/",
    address: "1050 N Mills Ave, Claremont, CA 91711",
    accent: "var(--hall-pitzer)",
    hours: "Weekdays 7:45a–10a / 11a–1:30p / 5–7:30p · Weekends brunch & dinner",
    source: {
      kind: "bamco",
      origin: "https://pitzer.cafebonappetit.com",
      frontPage: true,
    },
  },
  {
    id: "malott",
    name: "Malott Dining Commons",
    shortName: "Malott",
    college: "Scripps",
    collegeShort: "SC",
    sourceUrl: "https://scripps.cafebonappetit.com/",
    address: "1030 Columbia Ave, Claremont, CA 91711",
    accent: "var(--hall-scripps)",
    hours: "Breakfast 7:30–10a · Lunch 11a–2p · Dinner 5–7:15p",
    source: {
      kind: "bamco",
      origin: "https://scripps.cafebonappetit.com",
      slug: "malott-dining-commons",
    },
  },
  {
    id: "collins",
    name: "Collins Dining Hall",
    shortName: "Collins",
    college: "CMC",
    collegeShort: "CMC",
    sourceUrl: "https://collins-cmc.cafebonappetit.com/cafe/collins/",
    address: "888 N Columbia Ave, Claremont, CA 91711",
    accent: "var(--hall-cmc)",
    hours: "Breakfast 7:30–10a · Lunch 11a–1:30p · Dinner 5–7:30p",
    source: {
      kind: "bamco",
      origin: "https://collins-cmc.cafebonappetit.com",
      slug: "collins",
    },
  },
  {
    id: "hoch",
    name: "Hoch-Shanahan Dining Commons",
    shortName: "Hoch-Shanahan",
    college: "Harvey Mudd",
    collegeShort: "HMC",
    sourceUrl:
      "https://hmc.sodexomyway.com/en-us/locations/hoch-shanahan-dining-commons",
    address: "301 Platt Blvd, Claremont, CA 91711",
    accent: "var(--hall-hmc)",
    hours: "Weekdays 7:30–9:30a / 11:15a–1p / 5–7p · Weekends brunch & dinner",
    source: {
      kind: "sodexo",
      locationId: "13147001",
      menuId: "15258",
    },
  },
  {
    id: "frary",
    name: "Frary Dining Hall",
    shortName: "Frary",
    college: "Pomona",
    collegeShort: "PO",
    sourceUrl: "https://www.pomona.edu/administration/dining/menus/frary",
    address: "347 E 6th St, Claremont, CA 91711",
    accent: "var(--hall-frary)",
    hours: "Mon–Fri 7:30a–7:30p · Weekends brunch & dinner · peanut/tree-nut free",
    source: {
      kind: "pomona",
      jsonUrl: "https://api.pomona.edu/eatec/Frary.json",
    },
  },
  {
    id: "frank",
    name: "Frank Dining Hall",
    shortName: "Frank",
    college: "Pomona",
    collegeShort: "PO",
    sourceUrl: "https://www.pomona.edu/administration/dining/menus/frank",
    address: "260 E Bonita Ave, Claremont, CA 91711",
    accent: "var(--hall-frank)",
    hours: "Sun–Thu continental, brunch & dinner · closed Fri–Sat · peanut/tree-nut free",
    source: {
      kind: "pomona",
      jsonUrl: "https://api.pomona.edu/eatec/Frank.json",
    },
  },
];

export function hallById(id: HallId) {
  return HALLS.find((hall) => hall.id === id)!;
}
