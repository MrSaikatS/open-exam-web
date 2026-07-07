"use client";

import { Loader2Icon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { assignProctor, unassignProctor } from "@/server/actions/proctor";
import { Button } from "../shadcnui/button";

type Proctor = {
  id: string;
  name: string;
  email: string;
};

type Assignment = {
  id: string;
  proctorId: string;
  proctor: Proctor;
  assignedAt: Date;
};

type AssignProctorsProps = {
  examId: string;
  initialAssignments: Assignment[];
  availableProctors: Proctor[];
};

const AssignProctors = ({
  examId,
  initialAssignments,
  availableProctors,
}: AssignProctorsProps) => {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [available, setAvailable] = useState(availableProctors);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(availableProctors.length > 0);

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
      await assignProctor(examId, Array.from(selected));
      const added = available.filter((p) => selected.has(p.id));
      setAssignments((prev) => [
        ...added.map((p) => ({
          id: "",
          proctorId: p.id,
          proctor: p,
          assignedAt: new Date(),
        })),
        ...prev,
      ]);
      setAvailable((prev) => prev.filter((p) => !selected.has(p.id)));
      setSelected(new Set());
      toast.success(`${added.length} proctor(s) assigned`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign proctors");
    }
    setLoading(false);
  };

  const handleUnassign = async (proctorId: string) => {
    if (!confirm("Remove this proctor from the exam?")) return;
    setRemoving(proctorId);
    try {
      await unassignProctor(examId, proctorId);
      const removed = assignments.find((a) => a.proctorId === proctorId);
      if (removed) {
        setAvailable((prev) =>
          [...prev, removed.proctor].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
      }
      setAssignments((prev) => prev.filter((a) => a.proctorId !== proctorId));
      toast.success("Proctor removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove proctor");
    }
    setRemoving(null);
  };

  return (
    <div className="grid gap-6">
      {assignments.length > 0 && (
        <div className="grid gap-3">
          <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
            Assigned Proctors ({assignments.length})
          </h3>
          {assignments.map((a) => (
            <div
              key={a.proctorId}
              className="border-border bg-card flex items-center justify-between gap-4 rounded-3xl border p-4">
              <div className="grid gap-0.5">
                <span className="text-sm font-medium">{a.proctor.name}</span>
                <span className="text-muted-foreground text-xs">
                  {a.proctor.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => handleUnassign(a.proctorId)}
                disabled={removing === a.proctorId}>
                {removing === a.proctorId ?
                  <Loader2Icon className="size-3 animate-spin" />
                : <Trash2Icon className="text-destructive size-3" />}
              </Button>
            </div>
          ))}
        </div>
      )}

      {assignments.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No proctors assigned yet.
        </p>
      )}

      {available.length > 0 && showAdd && (
        <div className="border-border bg-muted/30 grid gap-4 rounded-3xl border p-4">
          <h3 className="text-sm font-medium">Add Proctors</h3>
          <div className="grid max-h-60 gap-1 overflow-y-auto">
            {available.map((p) => (
              <label
                key={p.id}
                className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelected(p.id)}
                  className="accent-foreground size-4"
                />
                <div>
                  <span className="text-sm">{p.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {p.email}
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
            <PlusIcon className="size-4" /> Add Proctors
          </Button>
        </div>
      )}

      {available.length === 0 && assignments.length > 0 && (
        <p className="text-muted-foreground text-xs">
          All proctors are already assigned to this exam.
        </p>
      )}
    </div>
  );
};

export { AssignProctors };
