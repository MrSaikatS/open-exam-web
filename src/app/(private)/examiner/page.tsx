import { StatCard } from "@/components/Dashboard/StatCard";
import {
  ExaminerDashboardSkeleton,
  ExaminerShellSkeleton,
} from "@/components/Examiner/ExaminerShellSkeleton";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { format } from "date-fns";
import {
  BookOpenIcon,
  FileTextIcon,
  GraduationCapIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";
import type { Metadata, Route } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Examiner dashboard",
};

const ExaminerDashboard = () => (
  <section className="grid gap-8">
    <Suspense fallback={<ExaminerShellSkeleton />}>
      <ExaminerDashboardContent />
    </Suspense>
  </section>
);

const ExaminerDashboardContent = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  return (
    <>
      <div>
        <h1 className="text-2xl font-medium">Examiner Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user.name}
        </p>
      </div>

      <Suspense fallback={<ExaminerDashboardSkeleton />}>
        <ExaminerDashboardStats userId={userId} />
      </Suspense>
    </>
  );
};

const ExaminerDashboardStats = async ({ userId }: { userId: string }) => {
  "use cache";
  cacheLife("minutes");
  cacheTag("examiner-dashboard");

  const [examCounts, questionCount, totalStudents, attemptCounts, recentExams] =
    await Promise.all([
      prisma.exam.groupBy({
        by: ["status"],
        where: { createdById: userId },
        _count: true,
      }),
      prisma.bankQuestion.count({ where: { createdById: userId } }),
      prisma.examAssignment.findMany({
        where: { exam: { createdById: userId } },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.examAttempt.findMany({
        where: { exam: { createdById: userId } },
        select: { status: true },
      }),
      prisma.exam.findMany({
        where: { createdById: userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          _count: {
            select: { questions: true, assignments: true, attempts: true },
          },
        },
      }),
    ]);

  const totalExams = examCounts.reduce((sum, g) => sum + g._count, 0);
  const publishedExams =
    examCounts.find((g) => g.status === "published")?._count ?? 0;
  const draftExams = examCounts.find((g) => g.status === "draft")?._count ?? 0;
  const totalAttempts = attemptCounts.length;
  const studentCount = totalStudents.length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileTextIcon className="text-primary size-6" />}
          label="My Exams"
          value={totalExams}
        />
        <StatCard
          icon={<BookOpenIcon className="text-primary size-6" />}
          label="Bank Questions"
          value={questionCount}
        />
        <StatCard
          icon={<UsersIcon className="text-primary size-6" />}
          label="Students Assigned"
          value={studentCount}
        />
        <StatCard
          icon={<GraduationCapIcon className="text-primary size-6" />}
          label="Total Attempts"
          value={totalAttempts}
        />
      </div>

      {totalExams > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Exam Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Published
                  </span>
                  <span className="font-medium">{publishedExams}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Draft</span>
                  <span className="font-medium">{draftExams}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {recentExams.length === 0 ?
            <div className="py-6 text-center">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t created any exams yet.
              </p>
              <Link
                href="/examiner/exams/new"
                as={"/examiner/exams/new" as Route}>
                <Button
                  variant="outline"
                  size="lg">
                  <PlusIcon className="size-4" />
                  Create Your First Exam
                </Button>
              </Link>
            </div>
          : <div className="grid gap-3">
              {recentExams.map((exam) => (
                <div
                  key={exam.id}
                  className="border-border bg-card flex items-center justify-between gap-4 rounded-3xl border p-4">
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {exam._count.questions} questions &middot;{" "}
                      {exam._count.assignments} students &middot;{" "}
                      {exam._count.attempts} attempt(s) &middot;{" "}
                      {format(exam.createdAt, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        exam.status === "published" ? "default" : "secondary"
                      }>
                      {exam.status}
                    </Badge>
                    <Link href={`/examiner/exams/${exam.id}` as Route}>
                      <Button
                        variant="outline"
                        size="lg">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          }
        </CardContent>
      </Card>
    </>
  );
};

export default ExaminerDashboard;
