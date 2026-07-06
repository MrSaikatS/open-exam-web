import {
  DashboardShellSkeleton,
  DashboardSkeleton,
} from "@/components/Dashboard/DashboardShellSkeleton";
import { StatCard } from "@/components/Dashboard/StatCard";
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
  LayoutDashboardIcon,
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
  description: "Admin dashboard",
};

const AdminDashboard = () => (
  <section className="grid gap-8">
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  </section>
);

const AdminDashboardContent = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <div>
        <h1 className="text-2xl font-medium">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user.name}
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <AdminDashboardStats />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/users"
              as={"/admin/users" as Route}>
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start">
                <UsersIcon className="size-4" />
                Manage Users
              </Button>
            </Link>
            <Link
              href="/admin/exams/new"
              as={"/admin/exams/new" as Route}>
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start">
                <PlusIcon className="size-4" />
                Create Exam
              </Button>
            </Link>
            <Link
              href="/admin/questions"
              as={"/admin/questions" as Route}>
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start">
                <BookOpenIcon className="size-4" />
                Question Bank
              </Button>
            </Link>
            <Link
              href="/admin/results"
              as={"/admin/results" as Route}>
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start">
                <LayoutDashboardIcon className="size-4" />
                View Results
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const AdminDashboardStats = async () => {
  "use cache";
  cacheLife("minutes");
  cacheTag("admin-dashboard");

  const [
    userCounts,
    examCounts,
    questionCount,
    attemptCounts,
    recentExams,
    recentAttempts,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.exam.groupBy({ by: ["status"], _count: true }),
    prisma.bankQuestion.count(),
    prisma.examAttempt.groupBy({ by: ["status"], _count: true }),
    prisma.exam.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        createdBy: { select: { name: true } },
        _count: {
          select: { questions: true, assignments: true, attempts: true },
        },
      },
    }),
    prisma.examAttempt.findMany({
      take: 5,
      orderBy: { submittedAt: { sort: "desc", nulls: "last" } },
      select: {
        id: true,
        status: true,
        autoScore: true,
        maxScore: true,
        submittedAt: true,
        user: { select: { name: true } },
        exam: { select: { title: true, id: true } },
      },
    }),
  ]);

  const totalUsers = userCounts.reduce((sum, g) => sum + g._count, 0);
  const totalExams = examCounts.reduce((sum, g) => sum + g._count, 0);
  const draftExams = examCounts.find((g) => g.status === "draft")?._count ?? 0;
  const publishedExams =
    examCounts.find((g) => g.status === "published")?._count ?? 0;
  const totalAttempts = attemptCounts.reduce((sum, g) => sum + g._count, 0);
  const inProgressAttempts =
    attemptCounts.find((g) => g.status === "in_progress")?._count ?? 0;
  const completedAttempts =
    attemptCounts.find((g) => g.status === "submitted")?._count ?? 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<UsersIcon className="text-primary size-6" />}
          label="Total Users"
          value={totalUsers}
        />
        <StatCard
          icon={<FileTextIcon className="text-primary size-6" />}
          label="Total Exams"
          value={totalExams}
        />
        <StatCard
          icon={<BookOpenIcon className="text-primary size-6" />}
          label="Bank Questions"
          value={questionCount}
        />
        <StatCard
          icon={<GraduationCapIcon className="text-primary size-6" />}
          label="Total Attempts"
          value={totalAttempts}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {userCounts.map((g) => (
                <div
                  key={g.role}
                  className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm capitalize">
                    {g.role}
                  </span>
                  <span className="font-medium">{g._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Published</span>
                <span className="font-medium">{publishedExams}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Draft</span>
                <span className="font-medium">{draftExams}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  In Progress
                </span>
                <span className="font-medium">{inProgressAttempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Completed</span>
                <span className="font-medium">{completedAttempts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {recentExams.length === 0 ?
              <p className="text-muted-foreground py-4 text-center text-sm">
                No exams created yet.
              </p>
            : <div className="grid gap-2">
                {recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="border-border flex items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/exams/${exam.id}` as Route}
                        className="hover:text-primary text-sm font-medium transition-colors">
                        {exam.title}
                      </Link>
                      <p className="text-muted-foreground text-xs">
                        {exam.createdBy.name} &middot;{" "}
                        {format(exam.createdAt, "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        exam.status === "published" ? "default" : "secondary"
                      }>
                      {exam.status}
                    </Badge>
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttempts.length === 0 ?
              <p className="text-muted-foreground py-4 text-center text-sm">
                No attempts yet.
              </p>
            : <div className="grid gap-2">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="border-border flex items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{attempt.user.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {attempt.exam.title}
                        {attempt.submittedAt &&
                          ` · ${format(attempt.submittedAt, "MMM d, yyyy")}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {attempt.status === "submitted" &&
                        attempt.autoScore !== null && (
                          <span className="text-xs font-medium">
                            {attempt.autoScore}/{attempt.maxScore}
                          </span>
                        )}
                      <Badge
                        variant={
                          attempt.status === "submitted" ? "default" : "outline"
                        }>
                        {attempt.status === "in_progress" ?
                          "In Progress"
                        : "Submitted"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            }
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;
