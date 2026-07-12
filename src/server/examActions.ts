"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
import { examFormSchema, questionFormSchema } from "@/lib/zodSchema";

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
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");

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

  let exam: Awaited<ReturnType<typeof prisma.exam.create>>;
  try {
    const parsed = examFormSchema.parse(Object.fromEntries(formData));

    exam = await prisma.exam.create({
      data: {
        title: parsed.title,
        description: parsed.description || null,
        duration: parsed.duration,
        startTime: parsed.startTime ? new Date(parsed.startTime) : null,
        endTime: parsed.endTime ? new Date(parsed.endTime) : null,
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
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to create exam");
  }
  return {
    id: exam.id,
    basePath: session.user.role === "admin" ? "/admin" : "/examiner",
  };
};

export const updateExam = async (id: string, formData: FormData) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  try {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new Error("Exam not found");

    if (session.user.role !== "admin" && exam.createdById !== session.user.id)
      throw new Error("You do not have permission to update this exam");

    if (exam.status !== "draft")
      throw new Error("Cannot update a published exam");

    const parsed = examFormSchema.parse(Object.fromEntries(formData));

    await prisma.exam.update({
      where: { id },
      data: {
        title: parsed.title,
        description: parsed.description || null,
        duration: parsed.duration,
        startTime: parsed.startTime ? new Date(parsed.startTime) : null,
        endTime: parsed.endTime ? new Date(parsed.endTime) : null,
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

    if (exam.status !== "draft")
      throw new Error("Cannot modify a published exam");

    const parsed = questionFormSchema.parse(Object.fromEntries(formData));

    const maxOrder = await prisma.question.findFirst({
      where: { examId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    await prisma.question.create({
      data: {
        examId,
        text: parsed.text,
        type: parsed.type,
        options: parsed.options || null,
        answer: parsed.answer,
        points: parsed.points,
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

    if (question.exam.status !== "draft")
      throw new Error("Cannot modify a published exam");

    const parsed = questionFormSchema.parse(Object.fromEntries(formData));

    await prisma.question.update({
      where: { id },
      data: {
        text: parsed.text,
        type: parsed.type,
        options: parsed.options || null,
        answer: parsed.answer,
        points: parsed.points,
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

    if (question.exam.status !== "draft")
      throw new Error("Cannot modify a published exam");

    await prisma.question.delete({ where: { id } });

    const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
    revalidatePath(`${basePath}/exams/${question.examId}`);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to delete question");
  }
};
