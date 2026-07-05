import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import ExamsTable from "@/components/Exam/ExamsTable";
import { getExams } from "@/server/actions/exam";

export const metadata: Metadata = {
  title: "My Exams",
  description: "Manage your exams",
};

const ExaminerExamsPage = async () => {
  const exams = await getExams();

  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">My Exams</h1>
        <Link href="/examiner/exams/new">
          <Button>
            <PlusIcon className="size-4" /> Create Exam
          </Button>
        </Link>
      </div>
      <ExamsTable
        exams={exams}
        basePath="/examiner"
      />
    </section>
  );
};

export default ExaminerExamsPage;
