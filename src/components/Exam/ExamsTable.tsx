"use client";

import { EditIcon, EyeIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { deleteExam, publishExam } from "@/server/actions/exam";
import { Button } from "../shadcnui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcnui/dialog";

type ExamRow = {
  id: string;
  title: string;
  status: string;
  duration: number;
  createdAt: Date;
  _count: { questions: number };
  createdBy: { name: string };
};

type ExamsTableProps = {
  exams: ExamRow[];
  basePath: string;
};

const ExamsTable = ({ exams, basePath }: ExamsTableProps) => {
  const { refresh } = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isAdmin = basePath === "/admin";

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    try {
      await deleteExam(id);
      toast.success("Exam deleted");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete exam");
    }
    setLoadingId(null);
  };

  const handlePublish = async (id: string) => {
    setLoadingId(id);
    try {
      await publishExam(id);
      toast.success("Exam published");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to publish exam");
    }
    setLoadingId(null);
  };

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground text-lg">No exams yet</p>
        <Link href={`${basePath}/exams/new` as Route}>
          <Button variant="default">Create your first exam</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="border-border overflow-x-auto rounded-3xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border bg-muted/50 border-b">
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Questions</th>
            <th className="px-4 py-3 text-left font-medium">Duration</th>
            <th className="px-4 py-3 text-left font-medium">Created by</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr
              key={exam.id}
              className="border-border hover:bg-muted/30 border-b last:border-0">
              <td className="px-4 py-3 font-medium">{exam.title}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    exam.status === "published" ?
                      "bg-green-500/10 text-green-600 dark:text-green-400"
                    : exam.status === "draft" ?
                      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    : "bg-muted text-muted-foreground"
                  }`}>
                  {exam.status}
                </span>
              </td>
              <td className="text-muted-foreground px-4 py-3">
                {exam._count.questions}
              </td>
              <td className="text-muted-foreground px-4 py-3">
                {exam.duration} min
              </td>
              <td className="text-muted-foreground px-4 py-3">
                {exam.createdBy.name}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`${basePath}/exams/${exam.id}` as Route}>
                    <Button
                      variant="outline"
                      size="icon-lg">
                      {loadingId === exam.id ?
                        <Loader2Icon className="size-4 animate-spin" />
                      : <EyeIcon className="size-4" />}
                    </Button>
                  </Link>
                  {exam.status === "draft" && (
                    <>
                      <Link href={`${basePath}/exams/${exam.id}` as Route}>
                        <Button
                          variant="outline"
                          size="icon-lg">
                          <EditIcon className="size-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handlePublish(exam.id)}
                        disabled={loadingId === exam.id}>
                        Publish
                      </Button>
                    </>
                  )}
                  {(exam.status === "draft" || isAdmin) && (
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button
                            variant="outline"
                            size="icon-lg"
                            disabled={loadingId === exam.id}>
                            <Trash2Icon className="text-destructive size-4" />
                          </Button>
                        }
                      />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Exam</DialogTitle>
                          <DialogDescription>
                            {exam.status === "published" ?
                              "This exam is published and assigned students may be affected. Are you sure you want to permanently delete it?"
                            : "Are you sure you want to delete this exam?"}
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter showCloseButton>
                          <DialogClose
                            render={
                              <Button
                                variant="destructive"
                                size="lg"
                                onClick={() => handleDelete(exam.id)}
                                disabled={loadingId === exam.id}>
                                {loadingId === exam.id ?
                                  <>
                                    <Loader2Icon className="size-4 animate-spin" />{" "}
                                    Deleting...
                                  </>
                                : <>
                                    <Trash2Icon className="size-4" /> Delete
                                  </>
                                }
                              </Button>
                            }
                          />
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamsTable;
