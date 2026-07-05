import type { Metadata } from "next";
import Link from "next/link";
import { getStudentExams } from "@/server/actions/studentExam";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { PlayIcon, EyeIcon, RotateCcwIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "My Exams",
  description: "View your exams",
};

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    published: {
      label: "Available",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
  };
  const s = map[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return <Badge className={s.className}>{s.label}</Badge>;
};

const attemptBadge = (status: string | undefined) => {
  const map: Record<string, { label: string; className: string }> = {
    in_progress: {
      label: "In Progress",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    submitted: {
      label: "Submitted",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    graded: {
      label: "Graded",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
  };
  if (!status) return null;
  const s = map[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return <Badge className={s.className}>{s.label}</Badge>;
};

const StudentExamsPage = async () => {
  const exams = await getStudentExams();

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-medium">My Exams</h1>
      {exams.length === 0 ?
        <Card>
          <CardHeader>
            <CardTitle>No exams assigned</CardTitle>
            <CardDescription>
              You haven&apos;t been assigned any exams yet.
            </CardDescription>
          </CardHeader>
        </Card>
      : <div className="grid gap-4">
          {exams.map((exam) => {
            const attempt = exam.attempt;
            return (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="grid gap-1">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription>{exam.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(exam.status)}
                      {attemptBadge(attempt?.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground flex gap-4 text-sm">
                      <span>{exam.duration} min</span>
                      <span>{exam._count.questions} questions</span>
                      <span>by {exam.createdBy.name}</span>
                    </div>
                    <div className="flex gap-2">
                      {exam.status === "published" && !attempt && (
                        <Link href={`/student/exams/${exam.id}`}>
                          <Button size="lg">
                            <PlayIcon className="size-4" /> Start
                          </Button>
                        </Link>
                      )}
                      {attempt?.status === "in_progress" && (
                        <Link href={`/student/exams/${exam.id}`}>
                          <Button size="lg">
                            <RotateCcwIcon className="size-4" /> Resume
                          </Button>
                        </Link>
                      )}
                      {(attempt?.status === "submitted" ||
                        attempt?.status === "graded") && (
                        <Link href={`/student/results/${attempt.id}`}>
                          <Button
                            variant="outline"
                            size="lg">
                            <EyeIcon className="size-4" /> View Result
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      }
    </section>
  );
};

export default StudentExamsPage;
