import { MenuBoard } from "@/components/menu-board";
import { resolveMenuDate } from "@/lib/menus";
import { todayOnCampus } from "@/lib/time";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const params = await searchParams;
  const date = resolveMenuDate(params.date);

  return <MenuBoard date={date} today={todayOnCampus()} />;
}
