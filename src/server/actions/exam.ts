"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";

export const getExams = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const role = session.user.role;

  if (role === "admin") {
    return prisma.exam.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true } },
        createdBy: { select: { name: true } },
      },
    });
  }

  if (role === "examiner") {
    return prisma.exam.findMany({
      where: { createdById: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true } },
        createdBy: { select: { name: true } },
      },
    });
  }

  redirect("/");
};

export const getExamById = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      createdBy: { select: { name: true } },
    },
  });

  if (!exam) redirect("/admin/exams");
  if (session.user.role === "examiner" && exam.createdById !== session.user.id)
    redirect("/examiner/exams");

  return exam;
};

export const createExam = async (formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const duration = parseInt(formData.get("duration") as string);
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  const exam = await prisma.exam.create({
    data: {
      title,
      description: description || null,
      duration,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      createdById: session.user.id,
    },
  });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams`);
  redirect(`${basePath}/exams/${exam.id}`);
};

export const updateExam = async (id: string, formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) redirect("/admin/exams");

  if (session.user.role !== "admin" && exam.createdById !== session.user.id)
    redirect("/");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const duration = parseInt(formData.get("duration") as string);
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  await prisma.exam.update({
    where: { id },
    data: {
      title,
      description: description || null,
      duration,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
    },
  });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams/${id}`);
};

export const deleteExam = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) return;

  if (session.user.role !== "admin" && exam.createdById !== session.user.id)
    return;

  await prisma.exam.delete({ where: { id } });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams`);
};

export const publishExam = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) return;

  if (session.user.role !== "admin" && exam.createdById !== session.user.id)
    return;

  await prisma.exam.update({
    where: { id },
    data: { status: "published" },
  });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams/${id}`);
};

export const addQuestion = async (examId: string, formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return;

  if (session.user.role !== "admin" && exam.createdById !== session.user.id)
    return;

  const text = formData.get("text") as string;
  const type = formData.get("type") as string;
  const options = formData.get("options") as string;
  const answer = formData.get("answer") as string;
  const points = parseInt(formData.get("points") as string);

  const maxOrder = await prisma.question.findFirst({
    where: { examId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.question.create({
    data: {
      examId,
      text,
      type,
      options: options || null,
      answer: answer || null,
      points: points || 1,
      order: (maxOrder?.order ?? -1) + 1,
    },
  });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams/${examId}`);
};

export const updateQuestion = async (id: string, formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const question = await prisma.question.findUnique({
    where: { id },
    include: { exam: true },
  });
  if (!question) return;

  if (
    session.user.role !== "admin" &&
    question.exam.createdById !== session.user.id
  )
    return;

  const text = formData.get("text") as string;
  const type = formData.get("type") as string;
  const options = formData.get("options") as string;
  const answer = formData.get("answer") as string;
  const points = parseInt(formData.get("points") as string);

  await prisma.question.update({
    where: { id },
    data: {
      text,
      type,
      options: options || null,
      answer: answer || null,
      points: points || 1,
    },
  });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams/${question.examId}`);
};

export const deleteQuestion = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const question = await prisma.question.findUnique({
    where: { id },
    include: { exam: true },
  });
  if (!question) return;

  if (
    session.user.role !== "admin" &&
    question.exam.createdById !== session.user.id
  )
    return;

  await prisma.question.delete({ where: { id } });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams/${question.examId}`);
};
