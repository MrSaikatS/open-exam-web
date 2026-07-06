import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { getStudentResults } from "@/server/actions/studentExam";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Button } from "@/components/shadcnui/button";
import { EyeIcon } from "lucide-react";
import { Badge } from "@/components/shadcnui/badge";

export const metadata: Metadata = {
  title: "My Results",
  description: "View your results",
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
  return <Badge className={s.className}>{s.label}</Badge>;
};

const StudentResultsPage = async () => {
  const results = await getStudentResults();

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-medium">My Results</h1>
      {results.length === 0 ?
        <Card>
          <CardHeader>
            <CardTitle>No results yet</CardTitle>
            <CardDescription>
              Complete an exam to see your results here.
            </CardDescription>
          </CardHeader>
        </Card>
      : <div className="grid gap-4">
          {results.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="grid gap-1">
                    <CardTitle className="text-lg">{r.exam.title}</CardTitle>
                    <CardDescription>
                      by {r.exam.createdBy.name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold tabular-nums">
                      {r.totalScore ?? r.autoScore ?? "?"}/{r.maxScore}
                    </span>
                    {statusBadge(r.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground flex gap-4 text-sm">
                    <span>{r._count.answers} answers</span>
                    <span>
                      {r.submittedAt ?
                        format(r.submittedAt, "MMM d, yyyy")
                      : "—"}
                    </span>
                  </div>
                  <Link href={`/student/results/${r.id}`}>
                    <Button
                      variant="outline"
                      size="lg">
                      <EyeIcon className="size-4" /> View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </section>
  );
};

export default StudentResultsPage;
