import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-[15px] font-medium tracking-tight">5C.</p>
      <h1 className="mt-6 text-3xl font-medium tracking-tight">Not found</h1>
      <Button className="mt-8" asChild>
        <Link href="/">Home</Link>
      </Button>
    </div>
  );
}
