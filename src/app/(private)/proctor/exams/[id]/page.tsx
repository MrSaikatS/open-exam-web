import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { ProctorExamMonitor } from "@/components/Proctor/ProctorExamMonitor";
import { getExamProgress } from "@/server/actions/proctor";

export const metadata: Metadata = {
  title: "Monitor Exam",
  description: "Monitor exam in progress",
};

const ProctorMonitorExamPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const data = await getExamProgress(id);

  return (
    <section className="grid gap-8">
      <div className="flex items-center gap-4">
        <Link href="/proctor/exams">
          <Button
            variant="outline"
            size="icon-lg">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-medium">{data.exam.title}</h1>
          <p className="text-muted-foreground text-sm">
            {data.exam.duration} min &middot; {data.questionCount} questions
            &middot; {data.totalAssigned} assigned student(s)
          </p>
        </div>
      </div>

      <ProctorExamMonitor
        examId={id}
        initialData={data}
      />
    </section>
  );
};

export default ProctorMonitorExamPage;
