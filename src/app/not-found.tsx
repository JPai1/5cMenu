import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
        5cMenu
      </p>
      <h1 className="font-heading mt-2 text-3xl">Page not found</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Menus live on the home page. Today’s dishes from all six 5C halls are
        there.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">Back to today’s menus</Link>
      </Button>
    </div>
  );
}
