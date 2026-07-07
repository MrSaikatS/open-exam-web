"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";

export const assignExam = async (examId: string, userIds: string[]) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new Error("Exam not found");

    if (session.user.role !== "admin" && exam.createdById !== session.user.id)
      throw new Error("You do not have permission to assign this exam");

    const data = userIds.map((userId) => ({
      examId,
      userId,
      assignedById: session.user.id,
    }));

    await prisma.$transaction(
      data.map((d) => prisma.examAssignment.create({ data: d })),
    );

    const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
    revalidatePath(`${basePath}/exams/${examId}/assign`);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to assign students");
  }
};

export const unassignExam = async (examId: string, userId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new Error("Exam not found");

    if (session.user.role !== "admin" && exam.createdById !== session.user.id)
      throw new Error("You do not have permission to modify this exam");

    await prisma.examAssignment.deleteMany({
      where: { examId, userId },
    });

    const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
    revalidatePath(`${basePath}/exams/${examId}/assign`);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to unassign student");
  }
};

export const getAssignedStudents = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    return await prisma.examAssignment.findMany({
      where: { examId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { assignedAt: "desc" },
    });
  } catch {
    throw new Error("Failed to fetch assigned students");
  }
};

export const getAvailableStudents = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    const assigned = await prisma.examAssignment.findMany({
      where: { examId },
      select: { userId: true },
    });
    const assignedIds = assigned.map((a) => a.userId);

    return await prisma.user.findMany({
      where: {
        role: "student",
        id: { notIn: assignedIds },
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  } catch {
    throw new Error("Failed to fetch available students");
  }
};
