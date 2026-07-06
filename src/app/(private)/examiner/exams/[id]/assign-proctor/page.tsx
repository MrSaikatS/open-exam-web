import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { AssignProctors } from "@/components/Exam/AssignProctors";
import { Button } from "@/components/shadcnui/button";
import { getExamById } from "@/server/actions/exam";
import {
  getAssignedProctors,
  getAvailableProctors,
} from "@/server/actions/proctor";

export const metadata: Metadata = {
  title: "Assign Proctors",
  description: "Assign proctors to exam",
};

const ExaminerAssignProctorPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const exam = await getExamById(id);
  const assignments = await getAssignedProctors(id);
  const availableProctors = await getAvailableProctors(id);

  return (
    <section className="grid gap-8">
      <div className="flex items-center gap-4">
        <Link href={`/examiner/exams/${id}`}>
          <Button
            variant="outline"
            size="icon-lg">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-medium">Assign Proctors</h1>
          <p className="text-muted-foreground text-sm">{exam.title}</p>
        </div>
      </div>

      <AssignProctors
        examId={id}
        initialAssignments={assignments}
        availableProctors={availableProctors}
      />
    </section>
  );
};

export default ExaminerAssignProctorPage;
