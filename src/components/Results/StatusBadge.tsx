const statusMap: Record<string, { label: string; className: string }> = {
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

const StatusBadge = ({ status }: { status: string }) => {
  const s = statusMap[status] ?? {
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

export { StatusBadge };
