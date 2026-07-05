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

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return;

  if (session.user.role !== "admin" && exam.createdById !== session.user.id)
    return;

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
};

export const unassignExam = async (examId: string, userId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return;

  if (session.user.role !== "admin" && exam.createdById !== session.user.id)
    return;

  await prisma.examAssignment.deleteMany({
    where: { examId, userId },
  });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams/${examId}/assign`);
};

export const getAssignedStudents = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  return prisma.examAssignment.findMany({
    where: { examId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { assignedAt: "desc" },
  });
};

export const getAvailableStudents = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const assigned = await prisma.examAssignment.findMany({
    where: { examId },
    select: { userId: true },
  });
  const assignedIds = assigned.map((a) => a.userId);

  return prisma.user.findMany({
    where: {
      role: "student",
      id: { notIn: assignedIds },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
};
