"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";

const requireExaminer = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");
  if (session.user.role !== "admin" && session.user.role !== "examiner")
    redirect("/");
  return session;
};

export const getBankQuestions = async () => {
  const session = await requireExaminer();
  void session;

  return prisma.bankQuestion.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
    },
  });
};

export const getBankQuestionById = async (id: string) => {
  const session = await requireExaminer();
  void session;

  const question = await prisma.bankQuestion.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
    },
  });

  if (!question) redirect("/admin/questions");
  return question;
};

export const createBankQuestion = async (formData: FormData) => {
  const session = await requireExaminer();

  const text = formData.get("text") as string;
  const type = formData.get("type") as string;
  const options = formData.get("options") as string;
  const answer = formData.get("answer") as string;
  const points = parseInt(formData.get("points") as string);

  await prisma.bankQuestion.create({
    data: {
      text,
      type,
      options: options || null,
      answer: answer || null,
      points: points || 1,
      createdById: session.user.id,
    },
  });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/questions`);
  revalidatePath(`${basePath}/exams`);
};

export const updateBankQuestion = async (id: string, formData: FormData) => {
  const session = await requireExaminer();

  const question = await prisma.bankQuestion.findUnique({ where: { id } });
  if (!question) return;

  const text = formData.get("text") as string;
  const type = formData.get("type") as string;
  const options = formData.get("options") as string;
  const answer = formData.get("answer") as string;
  const points = parseInt(formData.get("points") as string);

  await prisma.bankQuestion.update({
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
  revalidatePath(`${basePath}/questions`);
  revalidatePath(`${basePath}/questions/${id}`);
};

export const deleteBankQuestion = async (id: string) => {
  const session = await requireExaminer();
  if (session.user.role !== "admin") return;

  await prisma.bankQuestion.delete({ where: { id } });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/questions`);
};

export const importBankQuestions = async (
  examId: string,
  questionIds: string[],
) => {
  const session = await requireExaminer();

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return;

  if (session.user.role !== "admin" && exam.createdById !== session.user.id)
    return;

  const bankQuestions = await prisma.bankQuestion.findMany({
    where: { id: { in: questionIds } },
  });

  const maxOrder = await prisma.question.findFirst({
    where: { examId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  let order = (maxOrder?.order ?? -1) + 1;

  await prisma.question.createMany({
    data: bankQuestions.map((q) => ({
      examId,
      text: q.text,
      type: q.type,
      options: q.options,
      answer: q.answer,
      points: q.points,
      order: order++,
    })),
  });

  const basePath = session.user.role === "admin" ? "/admin" : "/examiner";
  revalidatePath(`${basePath}/exams/${examId}`);
};
