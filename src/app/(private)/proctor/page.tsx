import {
  EyeIcon,
  FileTextIcon,
  GraduationCapIcon,
  UsersIcon,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { StatCard } from "@/components/Dashboard/StatCard";
import prisma from "@/lib/database/dbClient";
import type { Route } from "next";

const ProctorDashboardPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  const proctorAssignments = await prisma.examProctor.findMany({
    where: { proctorId: session!.user.id },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          status: true,
          _count: { select: { assignments: true, attempts: true } },
        },
      },
    },
  });

  const examIds = proctorAssignments.map((pa) => pa.examId);

  const inProgressCount =
    examIds.length > 0 ?
      await prisma.examAttempt.count({
        where: { examId: { in: examIds }, status: "in_progress" },
      })
    : 0;

  const totalExams = proctorAssignments.length;
  const totalStudents = proctorAssignments.reduce(
    (sum, pa) => sum + pa.exam._count.assignments,
    0,
  );
  const totalAttempts = proctorAssignments.reduce(
    (sum, pa) => sum + pa.exam._count.attempts,
    0,
  );

  const examsWithActivity = proctorAssignments.filter(
    (pa) => pa.exam.status === "published" && pa.exam._count.attempts > 0,
  );

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="text-2xl font-medium">Proctor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileTextIcon className="text-primary size-6" />}
          label="Assigned Exams"
          value={totalExams}
        />
        <StatCard
          icon={<UsersIcon className="text-primary size-6" />}
          label="Total Students"
          value={totalStudents}
        />
        <StatCard
          icon={<GraduationCapIcon className="text-primary size-6" />}
          label="Total Attempts"
          value={totalAttempts}
        />
        <StatCard
          icon={<EyeIcon className="text-primary size-6" />}
          label="Active Now"
          value={inProgressCount}
        />
      </div>

      {examsWithActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Live Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {examsWithActivity.map((pa) => (
                <div
                  key={pa.id}
                  className="border-border flex items-center justify-between gap-4 rounded-3xl border p-4">
                  <div>
                    <p className="font-medium">
                      {pa.exam.title || `Exam ${pa.examId}`}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {pa.exam._count.assignments} students &middot;{" "}
                      {pa.exam._count.attempts} attempt(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <Badge variant="outline">
                      {pa.exam._count.attempts} active
                    </Badge>
                    <Link href={`/proctor/exams/${pa.examId}` as Route}>
                      <Button
                        variant="outline"
                        size="lg">
                        <EyeIcon className="size-4" /> Monitor
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {totalExams === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t been assigned to any exams yet.
          </p>
        </Card>
      )}

      {totalExams > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {proctorAssignments.map((pa) => (
                <div
                  key={pa.id}
                  className="border-border bg-card flex items-center justify-between gap-4 rounded-3xl border p-4">
                  <div>
                    <p className="font-medium">
                      {pa.exam.title || `Exam ${pa.examId}`}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {pa.exam._count.assignments} students &middot;{" "}
                      {pa.exam._count.attempts} attempt(s)
                    </p>
                  </div>
                  <Link href={`/proctor/exams/${pa.examId}` as Route}>
                    <Button
                      variant="outline"
                      size="lg">
                      <EyeIcon className="size-4" /> Monitor
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default ProctorDashboardPage;
