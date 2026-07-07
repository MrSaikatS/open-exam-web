"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";

export const getExams = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const role = session.user.role;
  if (role !== "admin" && role !== "examiner") redirect("/");

  try {
    if (role === "admin") {
      return await prisma.exam.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { questions: true } },
          createdBy: { select: { name: true } },
        },
      });
    }

    return await prisma.exam.findMany({
      where: { createdById: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true } },
        createdBy: { select: { name: true } },
      },
    });
  } catch {
    throw new Error("Failed to fetch exams");
  }
};

export const getExamById = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  let exam;
  try {
    exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        createdBy: { select: { name: true } },
      },
    });
  } catch {
    throw new Error("Failed to fetch exam");
  }

  if (!exam) {
    if (session.user.role === "admin") redirect("/admin/exams");
    redirect("/examiner/exams");
  }

  if (session.user.role === "examiner" && exam.createdById !== session.user.id)
    redirect("/examiner/exams");

  return exam;
};

export const createExam = async (formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

  try {
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
    if (session.user.role === "admin") {
      revalidateTag("admin-dashboard", "max");
    } else {
      revalidateTag("examiner-dashboard", "max");
    }
    redirect(`${basePath}/exams/${exam.id}`);
  } catch {
    throw new Error("Failed to create exam");
  }
};

export const updateExam = async (id: string, formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new Error("Exam not found");

    if (session.user.role !== "admin" && exam.createdById !== session.user.id)
      throw new Error("You do not have permission to update this exam");

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
    if (session.user.role === "admin") {
      revalidateTag("admin-dashboard", "max");
    } else {
      revalidateTag("examiner-dashboard", "max");
    }
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to update exam");
  }
};

export const deleteExam = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new Error("Exam not found");

    if (session.user.role !== "admin" && exam.createdById !== session.user.id)
      throw new Error("You do not have permission to delete this exam");

    if (session.user.role !== "admin" && exam.status === "published")
      throw new Error("Cannot delete a published exam");

    await prisma.exam.delete({ where: { id } });

    const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
    revalidatePath(`${basePath}/exams`);
    if (session.user.role === "admin") {
      revalidateTag("admin-dashboard", "max");
    } else {
      revalidateTag("examiner-dashboard", "max");
    }
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to delete exam");
  }
};

export const publishExam = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new Error("Exam not found");

    if (session.user.role !== "admin" && exam.createdById !== session.user.id)
      throw new Error("You do not have permission to publish this exam");

    await prisma.exam.update({
      where: { id },
      data: { status: "published" },
    });

    const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
    revalidatePath(`${basePath}/exams/${id}`);
    if (session.user.role === "admin") {
      revalidateTag("admin-dashboard", "max");
    } else {
      revalidateTag("examiner-dashboard", "max");
    }
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to publish exam");
  }
};

export const addQuestion = async (examId: string, formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new Error("Exam not found");

    if (session.user.role !== "admin" && exam.createdById !== session.user.id)
      throw new Error("You do not have permission to modify this exam");

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
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to add question");
  }
};

export const updateQuestion = async (id: string, formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: { exam: true },
    });
    if (!question) throw new Error("Question not found");

    if (
      session.user.role !== "admin" &&
      question.exam.createdById !== session.user.id
    )
      throw new Error("You do not have permission to modify this question");

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
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to update question");
  }
};

export const deleteQuestion = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: { exam: true },
    });
    if (!question) throw new Error("Question not found");

    if (
      session.user.role !== "admin" &&
      question.exam.createdById !== session.user.id
    )
      throw new Error("You do not have permission to delete this question");

    await prisma.question.delete({ where: { id } });

    const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
    revalidatePath(`${basePath}/exams/${question.examId}`);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to delete question");
  }
};
