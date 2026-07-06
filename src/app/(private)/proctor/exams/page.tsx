import type { Metadata } from "next";
import Link from "next/link";
import { EyeIcon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { Card } from "@/components/shadcnui/card";
import { getProctorExams } from "@/server/actions/proctor";

export const metadata: Metadata = {
  title: "Assigned Exams",
  description: "View your assigned exams",
};

const ProctorExamsPage = async () => {
  const exams = await getProctorExams();

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="text-2xl font-medium">Assigned Exams</h1>
        <p className="text-muted-foreground text-sm">
          Exams you are assigned to proctor
        </p>
      </div>

      {exams.length === 0 && (
        <Card className="p-8 text-center">
          <FileTextIcon className="text-muted-foreground mx-auto mb-4 size-8" />
          <p className="text-muted-foreground">
            You haven&apos;t been assigned to any exams yet.
          </p>
        </Card>
      )}

      {exams.length > 0 && (
        <div className="grid gap-3">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="border-border bg-card flex items-center justify-between gap-4 rounded-3xl border p-4">
              <div className="grid gap-0.5">
                <span className="text-sm font-medium">{exam.title}</span>
                <div className="text-muted-foreground flex items-center gap-3 text-xs">
                  <span>{exam._count.questions} question(s)</span>
                  <span>{exam._count.assignments} student(s)</span>
                  <span>{exam._count.attempts} attempt(s)</span>
                  <span className="bg-muted rounded-full px-2 py-0.5 text-[10px] uppercase">
                    {exam.status}
                  </span>
                </div>
              </div>
              <Link href={`/proctor/exams/${exam.id}`}>
                <Button
                  variant="outline"
                  size="lg">
                  <EyeIcon className="size-4" /> Monitor
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProctorExamsPage;
