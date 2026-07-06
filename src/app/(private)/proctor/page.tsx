import { EyeIcon, FileTextIcon, UsersIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/shadcnui/button";
import { Card } from "@/components/shadcnui/card";
import prisma from "@/lib/database/dbClient";

const ProctorDashboardPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  const proctorAssignments = await prisma.examProctor.findMany({
    where: { proctorId: session!.user.id },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          _count: { select: { assignments: true, attempts: true } },
        },
      },
    },
  });

  const totalExams = proctorAssignments.length;
  const totalStudents = proctorAssignments.reduce(
    (sum, pa) => sum + pa.exam._count.assignments,
    0,
  );
  const activeAttempts = proctorAssignments.reduce(
    (sum, pa) => sum + pa.exam._count.attempts,
    0,
  );

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="text-2xl font-medium">Proctor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-6">
          <div className="bg-primary/10 flex size-12 items-center justify-center rounded-2xl">
            <FileTextIcon className="text-primary size-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              Assigned Exams
            </p>
            <p className="text-2xl font-semibold">{totalExams}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="bg-primary/10 flex size-12 items-center justify-center rounded-2xl">
            <UsersIcon className="text-primary size-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              Total Students
            </p>
            <p className="text-2xl font-semibold">{totalStudents}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="bg-primary/10 flex size-12 items-center justify-center rounded-2xl">
            <EyeIcon className="text-primary size-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wider uppercase">
              Exam Attempts
            </p>
            <p className="text-2xl font-semibold">{activeAttempts}</p>
          </div>
        </Card>
      </div>

      {totalExams === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t been assigned to any exams yet.
          </p>
        </Card>
      )}

      {totalExams > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-medium">Your Assigned Exams</h2>
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
                <Link href={`/proctor/exams/${pa.examId}`}>
                  <Button
                    variant="outline"
                    size="lg">
                    <EyeIcon className="size-4" /> Monitor
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProctorDashboardPage;
