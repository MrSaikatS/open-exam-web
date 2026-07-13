import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Results",
  description: "View your exam results and scores",
};
import { format } from "date-fns";
import { getStudentResults } from "@/server/studentExamActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Button } from "@/components/shadcnui/button";
import { EyeIcon } from "lucide-react";
import { StatusBadge } from "@/components/Results/StatusBadge";

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
                    <StatusBadge status={r.status} />
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
