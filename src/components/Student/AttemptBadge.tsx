import { Badge } from "@/components/shadcnui/badge";

const attemptStatusMap: Record<string, { label: string; className: string }> = {
  in_progress: {
    label: "In Progress",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
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

const AttemptBadge = ({ status }: { status: string | undefined }) => {
  if (!status) return null;
  const s = attemptStatusMap[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return <Badge className={s.className}>{s.label}</Badge>;
};

export { AttemptBadge };
