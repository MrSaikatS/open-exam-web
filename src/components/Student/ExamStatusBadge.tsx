import { Badge } from "@/components/shadcnui/badge";

const examStatusMap: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  published: {
    label: "Available",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

const ExamStatusBadge = ({ status }: { status: string }) => {
  const s = examStatusMap[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };
  return <Badge className={s.className}>{s.label}</Badge>;
};

export { ExamStatusBadge };
