import type { Metadata, Route } from "next";
import Link from "next/link";
import { ArrowLeftIcon, BarChart3Icon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { getExamResults } from "@/server/actions/results";

export const metadata: Metadata = {
  title: "Exam Results",
  description: "View exam results",
};

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
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
  const s = map[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
};

const pctBadge = (pct: number) => {
  const className =
    pct >= 80 ?
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : pct >= 50 ?
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {pct}%
    </span>
  );
};

const ExaminerExamResultsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const data = await getExamResults(id);

  const scores = data.attempts.map((a) => a.totalScore ?? a.autoScore ?? 0);
  const avgScore =
    scores.length > 0 ?
      Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const avgPct =
    scores.length > 0 && data.attempts[0].maxScore > 0 ?
      Math.round((avgScore / data.attempts[0].maxScore) * 100)
    : 0;
  const maxScoreVal = scores.length > 0 ? Math.max(...scores) : 0;
  const minScoreVal = scores.length > 0 ? Math.min(...scores) : 0;
  const maxPossible = data.attempts[0]?.maxScore ?? 0;

  return (
    <section className="grid gap-8">
      <div className="flex items-center gap-4">
        <Link href="/examiner/exams">
          <Button
            variant="outline"
            size="icon-lg">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-medium">{data.examTitle}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="border-border rounded-2xl border p-4">
          <p className="text-muted-foreground text-sm">Attempts</p>
          <p className="text-2xl font-bold">{data.attempts.length}</p>
        </div>
        <div className="border-border rounded-2xl border p-4">
          <p className="text-muted-foreground text-sm">Average</p>
          <p className="text-2xl font-bold">{avgPct}%</p>
        </div>
        <div className="border-border rounded-2xl border p-4">
          <p className="text-muted-foreground text-sm">Highest</p>
          <p className="text-2xl font-bold tabular-nums">
            {maxScoreVal}/{maxPossible}
          </p>
        </div>
        <div className="border-border rounded-2xl border p-4">
          <p className="text-muted-foreground text-sm">Lowest</p>
          <p className="text-2xl font-bold tabular-nums">
            {minScoreVal}/{maxPossible}
          </p>
        </div>
      </div>

      {data.attempts.length === 0 ?
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">No results yet</p>
          <p className="text-muted-foreground text-sm">
            Students haven&apos;t submitted any attempts for this exam.
          </p>
        </div>
      : <div className="border-border overflow-x-auto rounded-3xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="px-4 py-3 text-left font-medium">Student</th>
                <th className="px-4 py-3 text-left font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">Percentage</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Submitted</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.attempts.map((attempt) => {
                const score = attempt.totalScore ?? attempt.autoScore ?? 0;
                const pct =
                  attempt.maxScore > 0 ?
                    Math.round((score / attempt.maxScore) * 100)
                  : 0;
                return (
                  <tr
                    key={attempt.id}
                    className="border-border hover:bg-muted/30 border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {attempt.student.name}
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {score}/{attempt.maxScore}
                    </td>
                    <td className="px-4 py-3">{pctBadge(pct)}</td>
                    <td className="px-4 py-3">{statusBadge(attempt.status)}</td>
                    <td className="text-muted-foreground px-4 py-3">
                      {attempt.submittedAt ?
                        new Date(attempt.submittedAt).toLocaleDateString()
                      : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <Link href={`/examiner/results/${attempt.id}` as Route}>
                          <Button
                            variant="outline"
                            size="icon-lg">
                            <BarChart3Icon className="size-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      }
    </section>
  );
};

export default ExaminerExamResultsPage;
