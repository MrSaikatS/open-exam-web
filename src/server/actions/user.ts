"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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

  try {
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
  } catch {
    throw new Error("Failed to fetch users");
  }
};

export const createUser = async (formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");

  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as Role;

    await auth.api.createUser({
      body: { name, email, password, role },
      headers: await headers(),
    });

    revalidatePath("/admin/users");
    revalidateTag("admin-dashboard", "max");
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to create user");
  }
};

export const deleteUser = async (userId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");
  if (session.user.id === userId)
    throw new Error("Cannot delete your own account");

  try {
    await auth.api.removeUser({
      body: { userId },
      headers: await headers(),
    });

    revalidatePath("/admin/users");
    revalidateTag("admin-dashboard", "max");
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to delete user");
  }
};

export const setUserRole = async (userId: string, role: Role) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");
  if (session.user.id === userId && role !== "admin")
    throw new Error("Cannot change your own role");

  try {
    await auth.api.setRole({
      body: { userId, role },
      headers: await headers(),
    });

    revalidatePath("/admin/users");
    revalidateTag("admin-dashboard", "max");
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to update user role");
  }
};

export const banUser = async (userId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");
  if (session.user.id === userId) throw new Error("Cannot ban yourself");

  try {
    await auth.api.banUser({
      body: { userId },
      headers: await headers(),
    });

    revalidatePath("/admin/users");
    revalidateTag("admin-dashboard", "max");
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to ban user");
  }
};

export const unbanUser = async (userId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/");

  try {
    await auth.api.unbanUser({
      body: { userId },
      headers: await headers(),
    });

    revalidatePath("/admin/users");
    revalidateTag("admin-dashboard", "max");
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to unban user");
  }
};
