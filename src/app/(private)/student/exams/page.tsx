import type { Metadata } from "next";
import Link from "next/link";
import { format, isAfter, isBefore } from "date-fns";
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
import { ExamStatusBadge } from "@/components/Student/ExamStatusBadge";
import { AttemptBadge } from "@/components/Student/AttemptBadge";
import { ClockIcon, EyeIcon, PlayIcon, RotateCcwIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "My Exams",
  description: "View your exams",
};

type TimeStatus = "available" | "not_yet_available" | "ended" | null;

const getTimeStatus = (exam: {
  startTime: Date | null;
  endTime: Date | null;
  status: string;
}): TimeStatus => {
  if (exam.status !== "published") return null;
  const now = new Date();
  if (exam.startTime && isBefore(now, exam.startTime))
    return "not_yet_available";
  if (exam.endTime && isAfter(now, exam.endTime)) return "ended";
  return "available";
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
            const timeStatus = getTimeStatus(exam);

            const timeBadge = () => {
              if (timeStatus === "not_yet_available")
                return (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <ClockIcon className="mr-1 size-3" /> Scheduled
                  </Badge>
                );
              if (timeStatus === "ended")
                return (
                  <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                    Ended
                  </Badge>
                );
              return null;
            };

            return (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="grid gap-1">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <CardDescription>{exam.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExamStatusBadge status={exam.status} />
                      <AttemptBadge status={attempt?.status} />
                      {timeBadge()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground flex gap-4 text-sm">
                      <span>{exam.duration} min</span>
                      <span>{exam._count.questions} questions</span>
                      <span>by {exam.createdBy.name}</span>
                      {exam.startTime && (
                        <span>
                          Starts {format(exam.startTime, "MMM d, yyyy")}
                        </span>
                      )}
                      {exam.endTime && (
                        <span>Ends {format(exam.endTime, "MMM d, yyyy")}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {exam.status === "published" &&
                        !attempt &&
                        timeStatus === "available" && (
                          <Link href={`/student/exams/${exam.id}`}>
                            <Button size="lg">
                              <PlayIcon className="size-4" /> Start
                            </Button>
                          </Link>
                        )}
                      {exam.status === "published" &&
                        !attempt &&
                        timeStatus === "not_yet_available" && (
                          <Button
                            size="lg"
                            disabled>
                            <ClockIcon className="size-4" /> Not Yet Available
                          </Button>
                        )}
                      {exam.status === "published" &&
                        !attempt &&
                        timeStatus === "ended" && (
                          <Button
                            size="lg"
                            disabled>
                            Ended
                          </Button>
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
