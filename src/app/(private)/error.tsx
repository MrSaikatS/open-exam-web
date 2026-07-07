"use client";

import { useEffect } from "react";
import { Button } from "@/components/shadcnui/button";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";

const PrivateErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <AlertTriangleIcon className="text-destructive size-12" />
      <div className="grid gap-2">
        <h1 className="text-foreground text-2xl font-medium">
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          An unexpected error occurred. Please try again or return to your
          dashboard.
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

export default PrivateErrorPage;
