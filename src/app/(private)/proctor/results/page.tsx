import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { StatusBadge } from "@/components/Results/StatusBadge";
import { PctBadge } from "@/components/Results/PctBadge";
import { getAllResults } from "@/server/actions/results";

export const metadata: Metadata = {
  title: "Results",
  description: "View exam results",
};

const ProctorResultsPage = async () => {
  const results = await getAllResults();

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-medium">Results</h1>

      {results.length === 0 ?
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">No results yet</p>
          <p className="text-muted-foreground text-sm">
            No exams have been submitted yet.
          </p>
        </div>
      : <div className="border-border overflow-x-auto rounded-3xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border bg-muted/50 border-b">
                <th className="px-4 py-3 text-left font-medium">Exam</th>
                <th className="px-4 py-3 text-left font-medium">Student</th>
                <th className="px-4 py-3 text-left font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">Percentage</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Submitted</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const score = r.totalScore ?? r.autoScore ?? 0;
                const pct =
                  r.maxScore > 0 ? Math.round((score / r.maxScore) * 100) : 0;
                return (
                  <tr
                    key={r.id}
                    className="border-border hover:bg-muted/30 border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/proctor/exams/${r.exam.id}` as Route}
                        className="hover:underline">
                        {r.exam.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{r.student.name}</td>
                    <td className="px-4 py-3 font-medium tabular-nums">
                      {score}/{r.maxScore}
                    </td>
                    <td className="px-4 py-3">{<PctBadge pct={pct} />}</td>
                    <td className="px-4 py-3">
                      {<StatusBadge status={r.status} />}
                    </td>
                    <td className="text-muted-foreground px-4 py-3">
                      {r.submittedAt ?
                        format(new Date(r.submittedAt), "MMM d, yyyy")
                      : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <Link href={`/proctor/results/${r.id}` as Route}>
                          <Button
                            variant="outline"
                            size="icon-lg">
                            <EyeIcon className="size-4" />
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

export default ProctorResultsPage;
