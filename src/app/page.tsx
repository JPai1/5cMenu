import { MenuBoard } from "@/components/menu-board";
import { getMenus, resolveMenuDate } from "@/lib/menus";
import {
  jsonLdScript,
  menuJsonLd,
  menuPath,
  seoDescription,
  seoTitle,
} from "@/lib/seo";
import { pageUrl } from "@/lib/site";
import { todayOnCampus } from "@/lib/time";
import type { Metadata } from "next";

export const revalidate = 900;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const today = todayOnCampus();
  const date = resolveMenuDate(params.date);
  const menus = await getMenus(date);
  const title = seoTitle(date, today);
  const description = seoDescription(menus, date, today);
  const path = menuPath(date, today);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: pageUrl(path),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const params = await searchParams;
  const date = resolveMenuDate(params.date);
  const menus = await getMenus(date);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(menuJsonLd(menus)) }}
      />
      <MenuBoard initial={menus} date={date} today={todayOnCampus()} />
    </>
  );
}
