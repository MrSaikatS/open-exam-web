import { Button } from "@/components/shadcnui/button";
import { FileQuestionIcon } from "lucide-react";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <section className="bg-background flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
      <FileQuestionIcon className="text-muted-foreground size-12" />
      <div className="grid gap-2">
        <h1 className="text-foreground text-2xl font-medium">Page not found</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button size="lg">Go Home</Button>
      </Link>
    </section>
  );
};

export default NotFoundPage;
