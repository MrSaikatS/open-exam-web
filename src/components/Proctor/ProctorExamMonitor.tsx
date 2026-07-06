"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ClockIcon, UsersIcon } from "lucide-react";
import { toast } from "react-toastify";
import { Badge } from "@/components/shadcnui/badge";
import { Card } from "@/components/shadcnui/card";
import { getExamProgress } from "@/server/actions/proctor";
import { format } from "date-fns";

type ExamProgress = Awaited<ReturnType<typeof getExamProgress>>;

interface ProctorExamMonitorProps {
  examId: string;
  initialData: ExamProgress;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "in_progress":
      return <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>;
    case "submitted":
      return <Badge className="bg-green-100 text-green-800">Submitted</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const ProctorExamMonitor = ({
  examId,
  initialData,
}: ProctorExamMonitorProps) => {
  const [data, setData] = useState<ExamProgress>(initialData);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const allSubmittedRef = useRef(
    initialData.attempts.length > 0 &&
      initialData.attempts.every((a) => a.status === "submitted"),
  );

  const fetchProgress = useCallback(async () => {
    try {
      const fresh = await getExamProgress(examId);
      setData(fresh);
      setLastUpdated(new Date());
      if (
        fresh.attempts.length > 0 &&
        fresh.attempts.every((a) => a.status === "submitted")
      ) {
        allSubmittedRef.current = true;
      }
    } catch {
      toast.error("Failed to fetch exam progress");
    }
  }, [examId]);

  useEffect(() => {
    if (allSubmittedRef.current) return;

    const interval = setInterval(() => {
      void fetchProgress();
    }, 2_000);

    return () => clearInterval(interval);
  }, [fetchProgress]);

  const submittedCount = data.attempts.filter(
    (a) => a.status === "submitted",
  ).length;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Total Students
          </p>
          <p className="text-2xl font-semibold">{data.totalAssigned}</p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Started
          </p>
          <p className="text-2xl font-semibold">{data.attempts.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Submitted
          </p>
          <p className="text-2xl font-semibold">{submittedCount}</p>
        </Card>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            Student Progress ({data.attempts.length})
          </h2>
          <span className="text-muted-foreground text-xs">
            Updated {format(lastUpdated, "h:mm:ss a")}
          </span>
        </div>

        {data.attempts.length === 0 && (
          <Card className="p-8 text-center">
            <UsersIcon className="text-muted-foreground mx-auto mb-4 size-8" />
            <p className="text-muted-foreground">
              No students have started this exam yet.
            </p>
          </Card>
        )}

        {data.attempts.map((attempt) => (
          <div
            key={attempt.id}
            className="border-border bg-card flex items-center justify-between gap-4 rounded-3xl border p-4">
            <div className="grid min-w-0 gap-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {attempt.student.name}
                </span>
                {statusBadge(attempt.status)}
              </div>
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span>
                  {attempt.answerCount} of {attempt.questionCount} answered
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="size-3" />
                  {attempt.timeSpentMinutes} min
                </span>
                <span>
                  Started {format(new Date(attempt.startedAt), "MMM d, h:mm a")}
                </span>
                {attempt.submittedAt && (
                  <span>
                    Submitted{" "}
                    {format(new Date(attempt.submittedAt), "MMM d, h:mm a")}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
