import type { ReactNode } from "react";
import { Card } from "@/components/shadcnui/card";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
};

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <Card className="p-6">
    <div className="flex items-center gap-4">
      <div className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-2xl">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs tracking-wider uppercase">
          {label}
        </p>
        <p className="text-2xl leading-none font-semibold">{value}</p>
      </div>
    </div>
  </Card>
);

export { StatCard };
