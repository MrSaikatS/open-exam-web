"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";

export const assignProctor = async (examId: string, proctorIds: string[]) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return;

  if (session.user.role !== "admin" && exam.createdById !== session.user.id)
    return;

  const data = proctorIds.map((userId) => ({
    examId,
    proctorId: userId,
    assignedById: session.user.id,
  }));

  await prisma.$transaction(
    data.map((d) => prisma.examProctor.create({ data: d })),
  );

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams/${examId}/assign-proctor`);
};

export const unassignProctor = async (examId: string, proctorId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return;

  if (session.user.role !== "admin" && exam.createdById !== session.user.id)
    return;

  await prisma.examProctor.deleteMany({
    where: { examId, proctorId },
  });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams/${examId}/assign-proctor`);
};

export const getAssignedProctors = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  return prisma.examProctor.findMany({
    where: { examId },
    include: {
      proctor: { select: { id: true, name: true, email: true } },
    },
    orderBy: { assignedAt: "desc" },
  });
};

export const getAvailableProctors = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const assigned = await prisma.examProctor.findMany({
    where: { examId },
    select: { proctorId: true },
  });
  const assignedIds = assigned.map((a) => a.proctorId);

  return prisma.user.findMany({
    where: {
      role: "proctor",
      id: { notIn: assignedIds },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
};

export const getProctorExams = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "proctor") redirect("/");

  const proctorAssignments = await prisma.examProctor.findMany({
    where: { proctorId: session.user.id },
    include: {
      exam: {
        include: {
          _count: {
            select: { questions: true, assignments: true, attempts: true },
          },
          createdBy: { select: { name: true } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return proctorAssignments.map((pa) => ({
    ...pa.exam,
    proctorAssignedAt: pa.assignedAt,
  }));
};

export const getExamProgress = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "proctor") redirect("/");

  const isAssigned = await prisma.examProctor.findUnique({
    where: { examId_proctorId: { examId, proctorId: session.user.id } },
  });
  if (!isAssigned) redirect("/proctor/exams");

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, title: true, duration: true, status: true },
  });

  if (!exam) redirect("/proctor/exams");

  const questionCount = await prisma.question.count({ where: { examId } });

  const attempts = await prisma.examAttempt.findMany({
    where: { examId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { answers: true } },
    },
    orderBy: { startedAt: "asc" },
  });

  const totalAssigned = await prisma.examAssignment.count({
    where: { examId },
  });

  const now = new Date();

  return {
    exam: {
      id: exam.id,
      title: exam.title,
      duration: exam.duration,
      status: exam.status,
    },
    questionCount,
    totalAssigned,
    attempts: attempts.map((a) => ({
      id: a.id,
      student: { id: a.user.id, name: a.user.name, email: a.user.email },
      status: a.status,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      answerCount: a._count.answers,
      questionCount,
      timeSpentMinutes:
        a.submittedAt ?
          Math.round((a.submittedAt.getTime() - a.startedAt.getTime()) / 60000)
        : Math.round((now.getTime() - a.startedAt.getTime()) / 60000),
    })),
  };
};
