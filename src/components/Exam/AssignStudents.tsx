"use client";

import { Loader2Icon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { assignExam, unassignExam } from "@/server/actions/assignment";
import { Button } from "../shadcnui/button";

type Student = {
  id: string;
  name: string;
  email: string;
};

type Assignment = {
  id: string;
  userId: string;
  user: Student;
  assignedAt: Date;
};

type AssignStudentsProps = {
  examId: string;
  initialAssignments: Assignment[];
  availableStudents: Student[];
};

const AssignStudents = ({
  examId,
  initialAssignments,
  availableStudents,
}: AssignStudentsProps) => {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [available, setAvailable] = useState(availableStudents);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(availableStudents.length > 0);

  const toggleSelected = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleAssign = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    try {
      await assignExam(examId, Array.from(selected));
      const added = available.filter((s) => selected.has(s.id));
      setAssignments((prev) => [
        ...added.map((s) => ({
          id: "",
          userId: s.id,
          user: s,
          assignedAt: new Date(),
        })),
        ...prev,
      ]);
      setAvailable((prev) => prev.filter((s) => !selected.has(s.id)));
      setSelected(new Set());
      toast.success(`${added.length} student(s) assigned`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign students");
    }
    setLoading(false);
  };

  const handleUnassign = async (userId: string) => {
    if (!confirm("Remove this student from the exam?")) return;
    setRemoving(userId);
    try {
      await unassignExam(examId, userId);
      const removed = assignments.find((a) => a.userId === userId);
      if (removed) {
        setAvailable((prev) =>
          [...prev, removed.user].sort((a, b) => a.name.localeCompare(b.name)),
        );
      }
      setAssignments((prev) => prev.filter((a) => a.userId !== userId));
      toast.success("Student removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove student");
    }
    setRemoving(null);
  };

  return (
    <div className="grid gap-6">
      {assignments.length > 0 && (
        <div className="grid gap-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Assigned Students ({assignments.length})
          </h3>
          {assignments.map((a) => (
            <div
              key={a.userId}
              className="border-border bg-card flex items-center justify-between gap-4 rounded-3xl border p-4">
              <div className="grid gap-0.5">
                <span className="text-sm font-medium">{a.user.name}</span>
                <span className="text-muted-foreground text-xs">
                  {a.user.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => handleUnassign(a.userId)}
                disabled={removing === a.userId}>
                {removing === a.userId ?
                  <Loader2Icon className="size-3 animate-spin" />
                : <Trash2Icon className="text-destructive size-3" />}
              </Button>
            </div>
          ))}
        </div>
      )}

      {assignments.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No students assigned yet.
        </p>
      )}

      {available.length > 0 && showAdd && (
        <div className="border-border bg-muted/30 grid gap-4 rounded-3xl border p-4">
          <h3 className="text-sm font-medium">Add Students</h3>
          <div className="grid max-h-60 gap-1 overflow-y-auto">
            {available.map((s) => (
              <label
                key={s.id}
                className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggleSelected(s.id)}
                  className="accent-foreground size-4"
                />
                <div>
                  <span className="text-sm">{s.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {s.email}
                  </span>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAssign}
              disabled={selected.size === 0 || loading}
              size="lg">
              {loading ?
                <Loader2Icon className="size-4 animate-spin" />
              : <PlusIcon className="size-4" />}
              Assign Selected ({selected.size})
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAdd(false)}>
              <XIcon className="size-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {available.length > 0 && !showAdd && (
        <div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowAdd(true)}>
            <PlusIcon className="size-4" /> Add Students
          </Button>
        </div>
      )}

      {available.length === 0 && assignments.length > 0 && (
        <p className="text-muted-foreground text-xs">
          All students are already assigned to this exam.
        </p>
      )}
    </div>
  );
};

export { AssignStudents };
