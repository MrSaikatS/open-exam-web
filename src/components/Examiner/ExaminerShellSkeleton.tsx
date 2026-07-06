import { Card, CardContent, CardHeader } from "@/components/shadcnui/card";

const ExaminerShellSkeleton = () => {
  return (
    <section className="grid gap-8">
      <div className="grid gap-2">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="bg-muted h-4 w-64 animate-pulse rounded" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="bg-muted mb-2 size-6 animate-pulse rounded-full" />
              <div className="bg-muted mb-1 h-3 w-24 animate-pulse rounded" />
              <div className="bg-muted h-6 w-16 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="bg-muted h-5 w-28 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[...Array(2)].map((_, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between">
                  <div className="bg-muted h-3 w-20 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-8 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="bg-muted h-5 w-24 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[...Array(5)].map((_, j) => (
              <div
                key={j}
                className="border-border flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div className="grid gap-1">
                  <div className="bg-muted h-3 w-36 animate-pulse rounded" />
                  <div className="bg-muted h-2 w-28 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

const ExaminerDashboardSkeleton = () => {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="bg-muted mb-2 size-6 animate-pulse rounded-full" />
              <div className="bg-muted mb-1 h-3 w-24 animate-pulse rounded" />
              <div className="bg-muted h-6 w-16 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="bg-muted h-5 w-28 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {[...Array(2)].map((_, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between">
                  <div className="bg-muted h-3 w-20 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-8 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="bg-muted h-5 w-24 animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[...Array(5)].map((_, j) => (
              <div
                key={j}
                className="border-border flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div className="grid gap-1">
                  <div className="bg-muted h-3 w-36 animate-pulse rounded" />
                  <div className="bg-muted h-2 w-28 animate-pulse rounded" />
                </div>
                <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export { ExaminerShellSkeleton, ExaminerDashboardSkeleton };
