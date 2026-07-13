import { format } from "date-fns";
import { Badge } from "@/components/shadcnui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Separator } from "@/components/shadcnui/separator";

const AccountInfo = ({
  email,
  role,
  createdAt,
}: {
  email: string | null | undefined;
  role: string | null | undefined;
  createdAt: Date | string | null | undefined;
}) => (
  <Card size="sm">
    <CardHeader>
      <CardTitle>Account Info</CardTitle>
    </CardHeader>
    <CardContent className="grid gap-4">
      {/* Email */}
      <div className="grid grid-cols-[100px_1fr] items-center gap-2 text-sm">
        <span className="text-muted-foreground">Email</span>
        <span>{email ?? "—"}</span>
      </div>

      <Separator />

      {/* Role */}
      <div className="grid grid-cols-[100px_1fr] items-center gap-2 text-sm">
        <span className="text-muted-foreground">Role</span>
        <Badge
          variant="outline"
          className="w-fit capitalize">
          {role ?? "Unknown"}
        </Badge>
      </div>

      <Separator />

      {/* Joined */}
      <div className="grid grid-cols-[100px_1fr] items-center gap-2 text-sm">
        <span className="text-muted-foreground">Joined</span>
        <span>
          {createdAt ? format(new Date(createdAt), "MMM d, yyyy") : "—"}
        </span>
      </div>
    </CardContent>
  </Card>
);

export { AccountInfo };
