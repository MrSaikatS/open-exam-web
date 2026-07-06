"use server";

import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";

export const getExamResults = async (examId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, title: true, createdById: true },
  });

  if (!exam) {
    redirect(
      session.user.role === "admin" ? "/admin/exams" : "/examiner/exams",
    );
  }

  if (
    session.user.role === "examiner" &&
    exam.createdById !== session.user.id
  ) {
    redirect("/examiner/exams");
  }

  const attempts = await prisma.examAttempt.findMany({
    where: { examId, status: { not: "in_progress" } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { answers: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  const questionCount = await prisma.question.count({ where: { examId } });

  return {
    examTitle: exam.title,
    questionCount,
    attempts: attempts.map((a) => ({
      id: a.id,
      student: { id: a.user.id, name: a.user.name, email: a.user.email },
      status: a.status,
      autoScore: a.autoScore,
      totalScore: a.totalScore,
      maxScore: a.maxScore,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      answerCount: a._count.answers,
      questionCount,
    })),
  };
};

export const getAllResults = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const where: Record<string, unknown> = {
    status: { not: "in_progress" },
  };

  if (session.user.role === "examiner") {
    const examIds = await prisma.exam.findMany({
      where: { createdById: session.user.id },
      select: { id: true },
    });
    where.examId = { in: examIds.map((e) => e.id) };
  } else if (session.user.role !== "admin") {
    redirect("/");
  }

  const attempts = await prisma.examAttempt.findMany({
    where,
    include: {
      exam: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return attempts.map((a) => ({
    id: a.id,
    exam: { id: a.exam.id, title: a.exam.title },
    student: { id: a.user.id, name: a.user.name, email: a.user.email },
    status: a.status,
    autoScore: a.autoScore,
    totalScore: a.totalScore,
    maxScore: a.maxScore,
    submittedAt: a.submittedAt,
  }));
};

export const getResultDetail = async (attemptId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: { orderBy: { order: "asc" } },
        },
      },
      answers: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!attempt) redirect("/");

  if (
    session.user.role === "examiner" &&
    attempt.exam.createdById !== session.user.id
  ) {
    redirect("/examiner/results");
  }

  return attempt;
};
