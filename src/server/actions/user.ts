"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type Role = "admin" | "examiner" | "proctor" | "student";

type ListUsersQuery = {
  searchValue?: string;
  searchField?: "email" | "name";
  searchOperator?: "contains" | "starts_with" | "ends_with";
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
};

export const getUsers = async (query?: ListUsersQuery) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");

  const data = await auth.api.listUsers({
    query: {
      limit: query?.limit ?? 20,
      offset: query?.offset ?? 0,
      sortBy: query?.sortBy ?? "createdAt",
      sortDirection: query?.sortDirection ?? "desc",
      searchValue: query?.searchValue,
      searchField: query?.searchField,
      searchOperator: query?.searchOperator,
    },
    headers: await headers(),
  });

  return data;
};

export const createUser = async (formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  await auth.api.createUser({
    body: { name, email, password, role },
    headers: await headers(),
  });

  revalidatePath("/admin/users");
};

export const deleteUser = async (userId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");
  if (session.user.id === userId) return;

  await auth.api.removeUser({
    body: { userId },
    headers: await headers(),
  });

  revalidatePath("/admin/users");
};

export const setUserRole = async (userId: string, role: Role) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");
  if (session.user.id === userId && role !== "admin") return;

  await auth.api.setRole({
    body: { userId, role },
    headers: await headers(),
  });

  revalidatePath("/admin/users");
};

export const banUser = async (userId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");
  if (session.user.id === userId) return;

  await auth.api.banUser({
    body: { userId },
    headers: await headers(),
  });

  revalidatePath("/admin/users");
};

export const unbanUser = async (userId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");

  await auth.api.unbanUser({
    body: { userId },
    headers: await headers(),
  });

  revalidatePath("/admin/users");
};
