import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { AssignStudents } from "@/components/Exam/AssignStudents";
import { Button } from "@/components/shadcnui/button";
import { getExamById } from "@/server/examActions";
import {
  getAssignedStudents,
  getAvailableStudents,
} from "@/server/assignmentActions";

export const metadata: Metadata = {
  title: "Assign Exam",
  description: "Assign exam to students",
};

const ExaminerAssignExamPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const exam = await getExamById(id);
  const assignments = await getAssignedStudents(id);
  const availableStudents = await getAvailableStudents(id);

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
          <h1 className="text-2xl font-medium">Assign Exam</h1>
          <p className="text-muted-foreground text-sm">{exam.title}</p>
        </div>
      </div>

      <AssignStudents
        examId={id}
        initialAssignments={assignments}
        availableStudents={availableStudents}
      />
    </section>
  );
};

export default ExaminerAssignExamPage;
