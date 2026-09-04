"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
        5cMenu
      </p>
      <h1 className="font-heading mt-2 text-3xl">Menus didn’t load</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        The dining sites may be briefly unreachable. Try again in a moment.
      </p>
      <Button className="mt-6" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
