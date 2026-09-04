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
      <p className="text-[15px] font-medium tracking-tight">5C.</p>
      <h1 className="mt-6 text-3xl font-medium tracking-tight">
        Couldn’t load
      </h1>
      <p className="mt-3 text-sm text-zinc-400">
        Try again in a moment.
      </p>
      <Button className="mt-8" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
