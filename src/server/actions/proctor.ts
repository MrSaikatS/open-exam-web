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

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new Error("Exam not found");

    if (session.user.role !== "admin" && exam.createdById !== session.user.id)
      throw new Error("You do not have permission to assign proctors");

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
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to assign proctors");
  }
};

export const unassignProctor = async (examId: string, proctorId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new Error("Exam not found");

    if (session.user.role !== "admin" && exam.createdById !== session.user.id)
      throw new Error("You do not have permission to modify this exam");

    await prisma.examProctor.deleteMany({
      where: { examId, proctorId },
    });

    const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
    revalidatePath(`${basePath}/exams/${examId}/assign-proctor`);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to unassign proctor");
  }
};

export const getAssignedProctors = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    return await prisma.examProctor.findMany({
      where: { examId },
      include: {
        proctor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { assignedAt: "desc" },
    });
  } catch {
    throw new Error("Failed to fetch assigned proctors");
  }
};

export const getAvailableProctors = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    const assigned = await prisma.examProctor.findMany({
      where: { examId },
      select: { proctorId: true },
    });
    const assignedIds = assigned.map((a) => a.proctorId);

    return await prisma.user.findMany({
      where: {
        role: "proctor",
        id: { notIn: assignedIds },
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  } catch {
    throw new Error("Failed to fetch available proctors");
  }
};

export const getProctorExams = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "proctor") redirect("/");

  try {
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
  } catch {
    throw new Error("Failed to fetch proctor exams");
  }
};

export const getExamProgress = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "proctor") redirect("/");

  try {
    const isAssigned = await prisma.examProctor.findUnique({
      where: { examId_proctorId: { examId, proctorId: session.user.id } },
    });
    if (!isAssigned) throw new Error("You are not assigned to this exam");

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, title: true, duration: true, status: true },
    });

    if (!exam) throw new Error("Exam not found");

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
            Math.round(
              (a.submittedAt.getTime() - a.startedAt.getTime()) / 60000,
            )
          : Math.round((now.getTime() - a.startedAt.getTime()) / 60000),
      })),
    };
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to fetch exam progress");
  }
};
