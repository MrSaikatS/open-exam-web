"use client";

import { Button } from "@/components/shadcnui/button";
import { AlertTriangleIcon } from "lucide-react";

const AdminErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <AlertTriangleIcon className="text-destructive size-12" />
      <div className="grid gap-2">
        <h1 className="text-foreground text-2xl font-medium">
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-md text-sm">
          {error.message || "An unexpected error occurred in the admin panel."}
        </p>
      </div>
      <Button
        variant="outline"
        size="lg"
        onClick={reset}>
        Try Again
      </Button>
    </section>
  );
};

export default AdminErrorPage;
