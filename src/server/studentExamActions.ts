"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { addMinutes, isAfter, isBefore, min } from "date-fns";
import { auth } from "@/lib/auth";
import prisma from "@/lib/database/dbClient";
const getStudentSession = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "student") redirect("/");
  return session;
};

export const getStudentExams = async () => {
  const session = await getStudentSession();

  try {
    const assignments = await prisma.examAssignment.findMany({
      where: { userId: session.user.id },
      include: {
        exam: {
          include: {
            _count: { select: { questions: true } },
            createdBy: { select: { name: true } },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    const examIds = assignments.map((a) => a.examId);

    const attempts = await prisma.examAttempt.findMany({
      where: { userId: session.user.id, examId: { in: examIds } },
      select: {
        examId: true,
        status: true,
        id: true,
        autoScore: true,
        totalScore: true,
        maxScore: true,
      },
    });

    const attemptMap = new Map(attempts.map((a) => [a.examId, a]));

    return assignments.map(({ exam }) => ({
      ...exam,
      attempt: attemptMap.get(exam.id) ?? null,
    }));
  } catch {
    throw new Error("Failed to fetch exams");
  }
};

export const startExam = async (examId: string) => {
  const session = await getStudentSession();

  try {
    const assignment = await prisma.examAssignment.findUnique({
      where: { examId_userId: { examId, userId: session.user.id } },
      include: { exam: true },
    });

    if (!assignment) throw new Error("You are not assigned to this exam");
    if (assignment.exam.status !== "published")
      throw new Error("This exam is not available");

    const existing = await prisma.examAttempt.findUnique({
      where: { userId_examId: { userId: session.user.id, examId } },
      include: { exam: { select: { endTime: true, duration: true } } },
    });

    if (existing) {
      if (existing.status === "in_progress") {
        const durationDeadline = addMinutes(
          existing.startedAt,
          existing.exam.duration,
        );
        const effectiveDeadline =
          existing.exam.endTime ?
            min([existing.exam.endTime, durationDeadline])
          : durationDeadline;

        if (isAfter(new Date(), effectiveDeadline)) {
          await submitAttempt(existing.id, examId);
          return await prisma.examAttempt.findUnique({
            where: { id: existing.id },
          });
        }
      }
      return existing;
    }

    const now = new Date();
    if (assignment.exam.startTime && isBefore(now, assignment.exam.startTime))
      throw new Error("This exam has not started yet");
    if (assignment.exam.endTime && isAfter(now, assignment.exam.endTime))
      throw new Error("This exam has ended");

    const totalPoints = await prisma.question.aggregate({
      where: { examId },
      _sum: { points: true },
    });

    const attempt = await prisma.examAttempt.create({
      data: {
        userId: session.user.id,
        examId,
        maxScore: totalPoints._sum.points ?? 0,
      },
    });

    return attempt;
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to start exam");
  }
};

export const getAttemptQuestions = async (attemptId: string) => {
  const session = await getStudentSession();

  let attempt;
  try {
    attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { select: { title: true, duration: true, createdById: true } },
      },
    });
  } catch {
    throw new Error("Failed to load exam questions");
  }

  if (!attempt || attempt.userId !== session.user.id)
    redirect("/student/exams");
  if (attempt.status !== "in_progress")
    return { attempt, questions: [] as never[], answers: [] as never[] };

  const questions = await prisma.question.findMany({
    where: { examId: attempt.examId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      examId: true,
      text: true,
      type: true,
      options: true,
      points: true,
      order: true,
    },
  });

  const answers = await prisma.answer.findMany({
    where: { attemptId },
  });

  return { attempt, questions, answers };
};

export const saveAnswer = async (
  attemptId: string,
  questionId: string,
  text: string,
) => {
  const session = await getStudentSession();

  try {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: { select: { endTime: true, duration: true } } },
    });
    if (!attempt || attempt.userId !== session.user.id)
      throw new Error("Unauthorized");
    if (attempt.status !== "in_progress")
      throw new Error("Exam already submitted");

    const durationDeadline = addMinutes(
      attempt.startedAt,
      attempt.exam.duration,
    );
    const effectiveDeadline =
      attempt.exam.endTime ?
        min([attempt.exam.endTime, durationDeadline])
      : durationDeadline;

    if (isAfter(new Date(), effectiveDeadline))
      throw new Error("The exam time has expired");

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question || question.examId !== attempt.examId)
      throw new Error("Question not found");

    await prisma.$transaction(async (tx) => {
      const current = await tx.examAttempt.findUnique({
        where: { id: attemptId },
        select: { status: true },
      });
      if (!current || current.status !== "in_progress")
        throw new Error("Exam already submitted");

      await tx.answer.upsert({
        where: { attemptId_questionId: { attemptId, questionId } },
        create: { attemptId, questionId, text },
        update: { text },
      });
    });
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to save answer");
  }
};

const autoGrade = (
  text: string,
  question: { type: string; answer: string | null; points: number },
): number => {
  if (!text || !question.answer) return 0;

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

  switch (question.type) {
    case "multiple_choice":
    case "single_choice":
    case "true_false":
      return normalize(text) === normalize(question.answer) ?
          question.points
        : 0;

    case "short_answer": {
      const keywords = question.answer
        .split(",")
        .map((k) => k.trim().toLowerCase());
      const normalizedText = normalize(text);
      const matchCount = keywords.filter((kw) =>
        normalizedText.includes(kw),
      ).length;
      if (matchCount === 0) return 0;
      return Math.round((question.points * matchCount) / keywords.length);
    }

    default:
      return 0;
  }
};

const submitAttempt = async (attemptId: string, examId: string) => {
  await prisma.$transaction(
    async (tx) => {
      const current = await tx.examAttempt.findUnique({
        where: { id: attemptId },
        select: { status: true },
      });
      if (!current || current.status !== "in_progress")
        throw new Error("Exam already submitted");

      const questions = await tx.question.findMany({
        where: { examId },
        orderBy: { order: "asc" },
      });

      const answers = await tx.answer.findMany({
        where: { attemptId },
      });

      const answerMap = new Map(answers.map((a) => [a.questionId, a]));

      let autoScore = 0;
      for (const question of questions) {
        const answer = answerMap.get(question.id);
        const text = answer?.text ?? "";
        const score = autoGrade(text, question);
        autoScore += score;

        if (answer) {
          await tx.answer.update({
            where: { id: answer.id },
            data: { score },
          });
        }
      }

      await tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: "submitted",
          submittedAt: new Date(),
          autoScore,
          totalScore: autoScore,
        },
      });
    },
    { timeout: 30_000 },
  );
};

export const submitExam = async (attemptId: string) => {
  const session = await getStudentSession();

  try {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: true },
    });

    if (!attempt || attempt.userId !== session.user.id)
      throw new Error("Unauthorized");
    if (attempt.status !== "in_progress")
      throw new Error("Exam already submitted");

    await submitAttempt(attemptId, attempt.examId);

    revalidatePath("/student/exams");
    revalidatePath(`/student/exams/${attempt.examId}`);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to submit exam");
  }
};

export const getStudentResults = async () => {
  const session = await getStudentSession();

  try {
    const attempts = await prisma.examAttempt.findMany({
      where: { userId: session.user.id, status: { not: "in_progress" } },
      include: {
        exam: {
          select: { title: true, createdBy: { select: { name: true } } },
        },
        _count: { select: { answers: true } },
      },
      orderBy: { submittedAt: "desc" },
    });

    return attempts;
  } catch {
    throw new Error("Failed to fetch results");
  }
};

export const getResultDetail = async (attemptId: string) => {
  const session = await getStudentSession();

  let attempt;
  try {
    attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: { orderBy: { order: "asc" } },
          },
        },
        answers: true,
      },
    });
  } catch {
    throw new Error("Failed to fetch result details");
  }

  if (!attempt || attempt.userId !== session.user.id)
    redirect("/student/results");

  if (attempt.status !== "submitted") redirect("/student/exams");

  return attempt;
};
