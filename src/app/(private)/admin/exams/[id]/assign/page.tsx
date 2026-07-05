import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { AssignStudents } from "@/components/Exam/AssignStudents";
import { Button } from "@/components/shadcnui/button";
import { getExamById } from "@/server/actions/exam";
import {
  getAssignedStudents,
  getAvailableStudents,
} from "@/server/actions/assignment";

export const metadata: Metadata = {
  title: "Assign Exam",
  description: "Assign exam to users",
};

const AdminAssignExamPage = async ({
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
        <Link href={`/admin/exams/${id}`}>
          <Button
            variant="ghost"
            size="icon">
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

export default AdminAssignExamPage;
