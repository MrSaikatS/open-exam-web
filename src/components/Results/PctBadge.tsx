const PctBadge = ({ pct }: { pct: number }) => {
  const className =
    pct >= 80 ?
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : pct >= 50 ?
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {pct}%
    </span>
  );
};

export { PctBadge };
