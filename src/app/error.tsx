"use client";

import { Button } from "@/components/shadcnui/button";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";

const RootErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <section className="bg-background flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
      <AlertTriangleIcon className="text-destructive size-12" />
      <div className="grid gap-2">
        <h1 className="text-foreground text-2xl font-medium">
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          An unexpected error occurred. Please try again or return to the home
          page.
        </p>
        {error.digest && (
          <p className="text-muted-foreground/50 text-xs">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={reset}>
          Try Again
        </Button>
        <Link href="/">
          <Button size="lg">Go Home</Button>
        </Link>
      </div>
    </section>
  );
};

export default RootErrorPage;
