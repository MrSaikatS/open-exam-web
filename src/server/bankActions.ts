"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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

const basePathFor = (role?: string | null) =>
  role === "admin" ? "/admin" : "/examiner";

const revalidateBank = (role?: string | null, ...extraPaths: string[]) => {
  const base = basePathFor(role);
  revalidatePath(`${base}/questions`);
  for (const path of extraPaths) {
    revalidatePath(path);
  }
  if (role === "admin") {
    revalidateTag("admin-dashboard", "max");
  } else {
    revalidateTag("examiner-dashboard", "max");
  }
};

// ── Subjects ──────────────────────────────────────────────────────────────

export const getSubjects = async () => {
  await requireExaminer();

  try {
    return await prisma.subject.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { topics: true } },
        topics: {
          select: {
            _count: { select: { questions: true } },
          },
        },
      },
    });
  } catch {
    throw new Error("Failed to fetch subjects");
  }
};

export const getSubjectById = async (id: string) => {
  const session = await requireExaminer();

  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: [{ order: "asc" }, { name: "asc" }],
          include: {
            _count: { select: { questions: true } },
          },
        },
      },
    });
    if (!subject) redirect(`${basePathFor(session.user.role)}/questions`);
    return subject;
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    throw new Error("Failed to fetch subject");
  }
};

export const createSubject = async (formData: FormData) => {
  const session = await requireExaminer();

  try {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;

    if (!name) throw new Error("Subject name is required");
    if (name.length > 100) throw new Error("Subject name is too long");

    await prisma.subject.create({
      data: {
        name,
        description,
      },
    });

    revalidateBank(session.user.role);
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    )
      throw new Error("A subject with this name already exists");
    if (e instanceof Error) throw e;
    throw new Error("Failed to create subject");
  }
};

export const updateSubject = async (id: string, formData: FormData) => {
  const session = await requireExaminer();

  try {
    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) throw new Error("Subject not found");

    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;

    if (!name) throw new Error("Subject name is required");
    if (name.length > 100) throw new Error("Subject name is too long");

    await prisma.subject.update({
      where: { id },
      data: { name, description },
    });

    revalidateBank(
      session.user.role,
      `${basePathFor(session.user.role)}/questions/subjects/${id}`,
    );
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    )
      throw new Error("A subject with this name already exists");
    if (e instanceof Error) throw e;
    throw new Error("Failed to update subject");
  }
};

export const deleteSubject = async (id: string) => {
  const session = await requireExaminer();
  if (session.user.role !== "admin")
    throw new Error("Only admins can delete subjects");

  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: { select: { topics: true } },
      },
    });
    if (!subject) throw new Error("Subject not found");
    if (subject._count.topics > 0)
      throw new Error("Remove all topics before deleting this subject");

    await prisma.subject.delete({ where: { id } });
    revalidateBank(session.user.role);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to delete subject");
  }
};

// ── Topics ────────────────────────────────────────────────────────────────

export const getTopicById = async (id: string) => {
  const session = await requireExaminer();

  try {
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        questions: {
          orderBy: { createdAt: "desc" },
          include: {
            createdBy: { select: { name: true } },
          },
        },
      },
    });
    if (!topic) redirect(`${basePathFor(session.user.role)}/questions`);
    return topic;
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    throw new Error("Failed to fetch topic");
  }
};

export const createTopic = async (subjectId: string, formData: FormData) => {
  const session = await requireExaminer();

  try {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new Error("Subject not found");

    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;

    if (!name) throw new Error("Topic name is required");
    if (name.length > 100) throw new Error("Topic name is too long");

    await prisma.topic.create({
      data: {
        name,
        description,
        subjectId,
      },
    });

    revalidateBank(
      session.user.role,
      `${basePathFor(session.user.role)}/questions/subjects/${subjectId}`,
    );
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    )
      throw new Error("A topic with this name already exists in the subject");
    if (e instanceof Error) throw e;
    throw new Error("Failed to create topic");
  }
};

export const updateTopic = async (id: string, formData: FormData) => {
  const session = await requireExaminer();

  try {
    const existing = await prisma.topic.findUnique({ where: { id } });
    if (!existing) throw new Error("Topic not found");

    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;

    if (!name) throw new Error("Topic name is required");
    if (name.length > 100) throw new Error("Topic name is too long");

    await prisma.topic.update({
      where: { id },
      data: { name, description },
    });

    revalidateBank(
      session.user.role,
      `${basePathFor(session.user.role)}/questions/subjects/${existing.subjectId}`,
      `${basePathFor(session.user.role)}/questions/topics/${id}`,
    );
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    )
      throw new Error("A topic with this name already exists in the subject");
    if (e instanceof Error) throw e;
    throw new Error("Failed to update topic");
  }
};

export const deleteTopic = async (id: string) => {
  const session = await requireExaminer();
  if (session.user.role !== "admin")
    throw new Error("Only admins can delete topics");

  try {
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        _count: { select: { questions: true } },
      },
    });
    if (!topic) throw new Error("Topic not found");
    if (topic._count.questions > 0)
      throw new Error("Remove all questions before deleting this topic");

    await prisma.topic.delete({ where: { id } });
    revalidateBank(
      session.user.role,
      `${basePathFor(session.user.role)}/questions/subjects/${topic.subjectId}`,
    );
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to delete topic");
  }
};

// ── Bank questions ────────────────────────────────────────────────────────

export const getBankQuestions = async () => {
  await requireExaminer();

  try {
    return await prisma.bankQuestion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { name: true } },
        topic: {
          select: {
            id: true,
            name: true,
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });
  } catch {
    throw new Error("Failed to fetch bank questions");
  }
};

export const getBankHierarchy = async () => {
  await requireExaminer();

  try {
    return await prisma.subject.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        topics: {
          orderBy: [{ order: "asc" }, { name: "asc" }],
          select: { id: true, name: true },
        },
      },
    });
  } catch {
    throw new Error("Failed to fetch bank hierarchy");
  }
};

export const getBankQuestionById = async (id: string) => {
  const session = await requireExaminer();

  try {
    const question = await prisma.bankQuestion.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        topic: {
          select: {
            id: true,
            name: true,
            subjectId: true,
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!question) redirect(`${basePathFor(session.user.role)}/questions`);
    return question;
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    throw new Error("Failed to fetch bank question");
  }
};

export const createBankQuestion = async (formData: FormData) => {
  const session = await requireExaminer();

  try {
    const text = formData.get("text") as string;
    const type = formData.get("type") as string;
    const options = formData.get("options") as string;
    const answer = formData.get("answer") as string;
    const points = parseInt(formData.get("points") as string);
    const topicId = formData.get("topicId") as string;

    if (!topicId) throw new Error("Topic is required");

    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new Error("Topic not found");

    await prisma.bankQuestion.create({
      data: {
        text,
        type,
        options: options || null,
        answer: answer || null,
        points: points || 1,
        topicId,
        createdById: session.user.id,
      },
    });

    const base = basePathFor(session.user.role);
    revalidateBank(
      session.user.role,
      `${base}/questions/topics/${topicId}`,
      `${base}/questions/subjects/${topic.subjectId}`,
      `${base}/exams`,
    );
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to create bank question");
  }
};

export const updateBankQuestion = async (id: string, formData: FormData) => {
  const session = await requireExaminer();

  try {
    const question = await prisma.bankQuestion.findUnique({ where: { id } });
    if (!question) throw new Error("Bank question not found");

    const text = formData.get("text") as string;
    const type = formData.get("type") as string;
    const options = formData.get("options") as string;
    const answer = formData.get("answer") as string;
    const points = parseInt(formData.get("points") as string);
    const topicId = formData.get("topicId") as string;

    if (!topicId) throw new Error("Topic is required");

    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new Error("Topic not found");

    await prisma.bankQuestion.update({
      where: { id },
      data: {
        text,
        type,
        options: options || null,
        answer: answer || null,
        points: points || 1,
        topicId,
      },
    });

    const base = basePathFor(session.user.role);
    revalidateBank(
      session.user.role,
      `${base}/questions/${id}`,
      `${base}/questions/topics/${topicId}`,
      `${base}/questions/topics/${question.topicId}`,
      `${base}/questions/subjects/${topic.subjectId}`,
    );
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to update bank question");
  }
};

export const deleteBankQuestion = async (id: string) => {
  const session = await requireExaminer();
  if (session.user.role !== "admin")
    throw new Error("Only admins can delete bank questions");

  try {
    const question = await prisma.bankQuestion.findUnique({
      where: { id },
      include: { topic: { select: { id: true, subjectId: true } } },
    });
    if (!question) throw new Error("Bank question not found");

    await prisma.bankQuestion.delete({ where: { id } });

    const base = basePathFor(session.user.role);
    revalidateBank(
      session.user.role,
      `${base}/questions/topics/${question.topicId}`,
      `${base}/questions/subjects/${question.topic.subjectId}`,
    );
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to delete bank question");
  }
};

export const importBankQuestions = async (
  examId: string,
  questionIds: string[],
) => {
  const session = await requireExaminer();

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new Error("Exam not found");

    if (session.user.role !== "admin" && exam.createdById !== session.user.id)
      throw new Error("You do not have permission to modify this exam");

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

    const basePath = basePathFor(session.user.role);
    revalidatePath(`${basePath}/exams/${examId}`);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error("Failed to import bank questions");
  }
};
