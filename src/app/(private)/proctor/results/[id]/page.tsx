import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { getResultDetail } from "@/server/resultsActions";
import { ResultReview } from "@/components/Student/ResultReview";

export const metadata: Metadata = {
  title: "Result Details",
  description: "View result details",
};

const ProctorResultDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const data = await getResultDetail(id);

  return (
    <section className="mx-auto grid max-w-3xl gap-6">
      <div className="flex items-center gap-4">
        <Link href={"/proctor/results" as unknown as Route}>
          <Button
            variant="outline"
            size="icon-lg">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div className="grid gap-1">
          <h1 className="text-2xl font-medium">{data.exam.title}</h1>
          <p className="text-muted-foreground text-sm">
            by {data.user.name} ({data.user.email})
          </p>
        </div>
      </div>

      <ResultReview
        autoScore={data.autoScore}
        totalScore={data.totalScore}
        maxScore={data.maxScore}
        submittedAt={data.submittedAt?.toISOString() ?? null}
        questions={data.exam.questions}
        answers={data.answers}
      />
    </section>
  );
};

export default ProctorResultDetailPage;
