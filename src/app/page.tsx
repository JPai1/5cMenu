import { MenuBoard } from "@/components/menu-board";
import { getMenus, resolveMenuDate } from "@/lib/menus";
import { todayOnCampus } from "@/lib/time";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const params = await searchParams;
  const date = resolveMenuDate(params.date);
  const menus = await getMenus(date);

  return <MenuBoard initial={menus} today={todayOnCampus()} />;
}
