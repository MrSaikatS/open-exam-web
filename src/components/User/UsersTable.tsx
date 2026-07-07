"use client";

import { format } from "date-fns";
import { Loader2Icon, SearchIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  banUser,
  deleteUser,
  getUsers,
  setUserRole,
  unbanUser,
} from "@/server/actions/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../shadcnui/alert-dialog";
import { Button } from "../shadcnui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../shadcnui/select";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
};

type UsersTableProps = {
  initialUsers: UserRow[];
  initialTotal: number;
};

const ROLES = ["admin", "examiner", "proctor", "student"] as const;

const UsersTable = ({ initialUsers, initialTotal }: UsersTableProps) => {
  const { refresh } = useRouter();
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const limit = 20;

  const fetchUsers = useCallback(
    async (searchValue: string, newOffset: number) => {
      setLoading(true);
      const data = await getUsers({
        searchValue: searchValue || undefined,
        searchField: searchValue ? "name" : undefined,
        searchOperator: "contains",
        limit,
        offset: newOffset,
      });
      setUsers(data.users as UserRow[]);
      setTotal(data.total);
      setOffset(newOffset);
      setLoading(false);
    },
    [],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(value, 0);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchUsers]);

  const handleDelete = async (userId: string) => {
    setLoadingId(userId);
    setPendingDeleteId(null);
    try {
      await deleteUser(userId);
      toast.success("User deleted");
      refresh();
      fetchUsers(search, offset);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete user");
    }
    setLoadingId(null);
  };

  const handleRoleChange = async (
    userId: string,
    role: "admin" | "examiner" | "proctor" | "student",
  ) => {
    setLoadingId(userId);
    try {
      await setUserRole(userId, role);
      toast.success("Role updated");
      refresh();
      fetchUsers(search, offset);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update role");
    }
    setLoadingId(null);
  };

  const handleBanToggle = async (user: UserRow) => {
    setLoadingId(user.id);
    try {
      if (user.banned) {
        await unbanUser(user.id);
        toast.success("User unbanned");
      } else {
        if (!confirm(`Ban ${user.name}? They will be unable to sign in.`)) {
          setLoadingId(null);
          return;
        }
        await banUser(user.id);
        toast.success("User banned");
      }
      refresh();
      fetchUsers(search, offset);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update user");
    }
    setLoadingId(null);
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-border bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 w-full rounded-4xl border py-2 pr-4 pl-10 text-sm outline-none focus-visible:ring-3"
          />
        </div>
      </div>

      <div className="border-border overflow-x-auto rounded-3xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border bg-muted/50 border-b">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ?
              Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-border border-b last:border-0">
                  <td
                    colSpan={6}
                    className="px-4 py-3">
                    <div className="bg-muted h-5 w-full animate-pulse rounded" />
                  </td>
                </tr>
              ))
            : users.length === 0 ?
              <tr>
                <td
                  colSpan={6}
                  className="text-muted-foreground px-4 py-8 text-center">
                  {search ? "No users match your search" : "No users found"}
                </td>
              </tr>
            : users.map((user) => (
                <tr
                  key={user.id}
                  className="border-border hover:bg-muted/30 border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="text-muted-foreground px-4 py-3">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(
                          user.id,
                          value as "admin" | "examiner" | "proctor" | "student",
                        )
                      }
                      disabled={loadingId === user.id}>
                      <SelectTrigger
                        size="sm"
                        className="text-xs font-medium">
                        <span>
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem
                            key={r}
                            value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    {user.banned ?
                      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                        Banned
                      </span>
                    : <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                        Active
                      </span>
                    }
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {format(user.createdAt, "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleBanToggle(user)}
                        disabled={loadingId === user.id}>
                        {loadingId === user.id ?
                          <Loader2Icon className="size-3 animate-spin" />
                        : user.banned ?
                          "Unban"
                        : "Ban"}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setPendingDeleteId(user.id)}
                        disabled={loadingId === user.id}>
                        {loadingId === user.id ?
                          <Loader2Icon className="size-4 animate-spin" />
                        : <Trash2Icon className="text-destructive size-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0 || loading}
              onClick={() => fetchUsers(search, offset - limit)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= total || loading}
              onClick={() => fetchUsers(search, offset + limit)}>
              Next
            </Button>
          </div>
        </div>
      )}
      <AlertDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this user? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => pendingDeleteId && handleDelete(pendingDeleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersTable;
