import { getMenus, resolveMenuDate } from "@/lib/menus";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = resolveMenuDate(searchParams.get("date"));
  const menus = await getMenus(date);
  return NextResponse.json(menus, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
    },
  });
}
