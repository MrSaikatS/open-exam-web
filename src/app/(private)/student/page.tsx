import type { Metadata } from "next";
import { format, isAfter } from "date-fns";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/database/dbClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Button } from "@/components/shadcnui/button";
import { Badge } from "@/components/shadcnui/badge";
import { StatCard } from "@/components/Dashboard/StatCard";
import {
  ClockIcon,
  FileTextIcon,
  GraduationCapIcon,
  PlayIcon,
  RotateCcwIcon,
  TargetIcon,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Student dashboard",
};

const StudentDashboard = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const [assignments, attempts, recentAttempts] = await Promise.all([
    prisma.examAssignment.findMany({
      where: { userId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            status: true,
            duration: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    }),
    prisma.examAttempt.findMany({
      where: { userId },
      select: {
        id: true,
        examId: true,
        status: true,
        autoScore: true,
        maxScore: true,
      },
    }),
    prisma.examAttempt.findMany({
      where: { userId, status: { in: ["submitted", "graded"] } },
      take: 5,
      orderBy: { submittedAt: { sort: "desc", nulls: "last" } },
      include: {
        exam: { select: { title: true } },
      },
    }),
  ]);

  const now = new Date();
  const completedAttempts = attempts.filter(
    (a) => a.status === "submitted" || a.status === "graded",
  );
  const inProgressAttempts = attempts.filter((a) => a.status === "in_progress");
  const attemptExamIds = new Set(attempts.map((a) => a.examId));
  const pendingExams = assignments.filter(
    (a) =>
      a.exam.status === "published" &&
      !attemptExamIds.has(a.examId) &&
      (!a.exam.startTime || !isAfter(a.exam.startTime, now)) &&
      (!a.exam.endTime || isAfter(a.exam.endTime, now)),
  );
  const upcomingExams = assignments.filter(
    (a) =>
      a.exam.status === "published" &&
      !attemptExamIds.has(a.examId) &&
      a.exam.startTime &&
      isAfter(a.exam.startTime, now),
  );

  const avgScore =
    completedAttempts.length > 0 ?
      Math.round(
        completedAttempts.reduce((sum, a) => sum + (a.autoScore ?? 0), 0) /
          completedAttempts.length,
      )
    : null;

  const maxAvgScore =
    completedAttempts.length > 0 ?
      Math.round(
        completedAttempts.reduce((sum, a) => sum + (a.maxScore ?? 1), 0) /
          completedAttempts.length,
      )
    : null;

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="text-2xl font-medium">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileTextIcon className="text-primary size-6" />}
          label="Pending Exams"
          value={pendingExams.length}
        />
        <StatCard
          icon={<RotateCcwIcon className="text-primary size-6" />}
          label="In Progress"
          value={inProgressAttempts.length}
        />
        <StatCard
          icon={<GraduationCapIcon className="text-primary size-6" />}
          label="Completed"
          value={completedAttempts.length}
        />
        <StatCard
          icon={<TargetIcon className="text-primary size-6" />}
          label="Avg Score"
          value={avgScore !== null ? `${avgScore}/${maxAvgScore}` : "—"}
        />
      </div>

      {pendingExams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {pendingExams.map((a) => (
                <div
                  key={a.examId}
                  className="border-border flex items-center justify-between gap-4 rounded-3xl border p-4">
                  <div>
                    <p className="font-medium">{a.exam.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {a.exam.duration} min
                      {a.exam.endTime &&
                        ` · ends ${format(a.exam.endTime, "MMM d, yyyy")}`}
                    </p>
                  </div>
                  <Link href={`/student/exams/${a.exam.id}` as Route}>
                    <Button size="lg">
                      <PlayIcon className="size-4" /> Start
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {upcomingExams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {upcomingExams.map((a) => (
                <div
                  key={a.examId}
                  className="border-border flex items-center justify-between gap-4 rounded-3xl border p-4">
                  <div>
                    <p className="font-medium">{a.exam.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {a.exam.duration} min
                      {a.exam.startTime &&
                        ` · starts ${format(a.exam.startTime, "MMM d, yyyy")}`}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    disabled>
                    <ClockIcon className="size-4" /> Scheduled
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {inProgressAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {inProgressAttempts.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="border-border flex items-center justify-between gap-4 rounded-3xl border p-4">
                  <div>
                    <p className="font-medium">Exam in progress</p>
                  </div>
                  <Link href={`/student/exams` as Route}>
                    <Button size="lg">
                      <RotateCcwIcon className="size-4" /> Resume
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {recentAttempts.map((a) => (
                <div
                  key={a.id}
                  className="border-border flex items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{a.exam.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {a.submittedAt ?
                        format(a.submittedAt, "MMM d, yyyy")
                      : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.autoScore !== null && (
                      <span className="text-xs font-medium">
                        {a.autoScore}/{a.maxScore}
                      </span>
                    )}
                    <Badge
                      variant={a.status === "graded" ? "default" : "outline"}>
                      {a.status === "graded" ? "Graded" : "Submitted"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {assignments.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t been assigned any exams yet.
          </p>
          <p className="text-muted-foreground text-xs">
            Contact your examiner to get started.
          </p>
        </Card>
      )}
    </section>
  );
};

export default StudentDashboard;
