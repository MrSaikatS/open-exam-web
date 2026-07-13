import { hash as argon2Hash } from "@node-rs/argon2";
import "dotenv/config";
import prisma from "../src/lib/database/dbClient";
import { serverEnv } from "../src/lib/env/serverEnv";

async function upsertUser(
  email: string,
  name: string,
  role: string,
  password: string,
) {
  const hashedPassword = await argon2Hash(password, {
    secret: Buffer.from(serverEnv.BETTER_AUTH_SECRET),
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: { role, emailVerified: true },
    create: { email, name, role, emailVerified: true },
  });

  const existingAccount = await prisma.account.findFirst({
    where: { providerId: "credential", accountId: email },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: hashedPassword },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: email,
        password: hashedPassword,
      },
    });
  }

  console.log(`Seeded ${role} user: ${email}`);
}

async function main() {
  // Clean up any accounts with the old providerId "email" (pre-v1.7 Better Auth)
  await prisma.account.deleteMany({
    where: { providerId: "email" },
  });

  const adminEmail =
    serverEnv.BETTER_AUTH_SEED_ADMIN_EMAIL ?? "admin@example.com";
  await upsertUser(adminEmail, "Administrator", "admin", adminEmail);

  const roleAccounts: { email: string; name: string; role: string }[] = [
    { email: "examiner@example.com", name: "Examiner", role: "examiner" },
    { email: "proctor@example.com", name: "Proctor", role: "proctor" },
    { email: "student@example.com", name: "Student", role: "student" },
  ];

  for (const { email, name, role } of roleAccounts) {
    await upsertUser(email, name, role, email);
  }

  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  const examiner = await prisma.user.findFirst({
    where: { role: "examiner" },
  });

  if (!admin || !examiner) {
    console.warn(
      "Skipping question seed: admin or examiner user not found. " +
        "Run `bun seed` again after the users are created.",
    );
    return;
  }

  const ensureSubject = async (name: string, description?: string) => {
    const existing = await prisma.subject.findUnique({ where: { name } });
    if (existing) return existing;
    return prisma.subject.create({
      data: { name, description: description ?? null },
    });
  };

  const ensureTopic = async (
    subjectId: string,
    name: string,
    description?: string,
  ) => {
    const existing = await prisma.topic.findUnique({
      where: { subjectId_name: { subjectId, name } },
    });
    if (existing) return existing;
    return prisma.topic.create({
      data: { subjectId, name, description: description ?? null },
    });
  };

  const programming = await ensureSubject(
    "Programming",
    "Software development and computer science topics",
  );
  const jsTopic = await ensureTopic(
    programming.id,
    "JavaScript",
    "Language fundamentals and runtimes",
  );
  const webTopic = await ensureTopic(
    programming.id,
    "Web & APIs",
    "HTTP, REST, and web concepts",
  );
  const csTopic = await ensureTopic(
    programming.id,
    "CS Fundamentals",
    "Algorithms, OOP, databases, and tooling",
  );

  // Keep Uncategorized/General if present from migration (for orphan questions)
  await ensureSubject(
    "Uncategorized",
    "Default subject for questions without a category",
  );

  const seedQuestion = async (
    text: string,
    type: string,
    answer: string,
    points: number,
    createdById: string,
    topicId: string,
    options?: string,
  ) => {
    const existing = await prisma.bankQuestion.findFirst({
      where: { text, type, createdById },
    });

    if (existing) {
      await prisma.bankQuestion.update({
        where: { id: existing.id },
        data: {
          text,
          type,
          options: options ?? null,
          answer,
          points,
          topicId,
        },
      });
    } else {
      await prisma.bankQuestion.create({
        data: {
          text,
          type,
          options: options ?? null,
          answer,
          points,
          topicId,
          createdById,
        },
      });
    }
  };

  const adminQuestions: {
    text: string;
    type: string;
    options?: string;
    answer: string;
    points: number;
    topicId: string;
  }[] = [
    {
      text: "Which of the following are primitive data types in JavaScript?",
      type: "multiple_choice",
      options: "String\nNumber\nObject\nBoolean\nArray",
      answer: "String\nNumber\nBoolean",
      points: 2,
      topicId: jsTopic.id,
    },
    {
      text: "What does the 'this' keyword refer to in a JavaScript arrow function?",
      type: "single_choice",
      options:
        "The function itself\nThe global object\nThe enclosing lexical context\nThe new instance",
      answer: "The enclosing lexical context",
      points: 2,
      topicId: jsTopic.id,
    },
    {
      text: "TypeScript is a superset of JavaScript that adds optional static typing.",
      type: "true_false",
      options: "True\nFalse",
      answer: "True",
      points: 1,
      topicId: jsTopic.id,
    },
    {
      text: "What does REST stand for in web API design?",
      type: "short_answer",
      answer: "Representational, State, Transfer",
      points: 2,
      topicId: webTopic.id,
    },
    {
      text: "Which time complexity does an efficient sorting algorithm like merge sort have?",
      type: "single_choice",
      options: "O(n)\nO(n²)\nO(n log n)\nO(log n)",
      answer: "O(n log n)",
      points: 2,
      topicId: csTopic.id,
    },
  ];

  const examinerQuestions: {
    text: string;
    type: string;
    options?: string;
    answer: string;
    points: number;
    topicId: string;
  }[] = [
    {
      text: "In OOP, encapsulation refers to bundling data with the methods that operate on it.",
      type: "true_false",
      options: "True\nFalse",
      answer: "True",
      points: 1,
      topicId: csTopic.id,
    },
    {
      text: "Which design pattern ensures a class has only one instance?",
      type: "single_choice",
      options: "Factory\nObserver\nSingleton\nDecorator",
      answer: "Singleton",
      points: 2,
      topicId: csTopic.id,
    },
    {
      text: "What Git command is used to temporarily save uncommitted changes?",
      type: "short_answer",
      answer: "stash",
      points: 1,
      topicId: csTopic.id,
    },
    {
      text: "Which of the following are JavaScript runtime environments?",
      type: "multiple_choice",
      options: "Node.js\nDeno\nPython\nBun",
      answer: "Node.js\nDeno\nBun",
      points: 2,
      topicId: jsTopic.id,
    },
    {
      text: "What does ACID stand for in database transactions?",
      type: "single_choice",
      options:
        "Atomicity, Consistency, Isolation, Durability\nAvailability, Consistency, Isolation, Durability\nAtomicity, Consistency, Integrity, Durability\nAtomicity, Control, Isolation, Distribution",
      answer: "Atomicity, Consistency, Isolation, Durability",
      points: 2,
      topicId: csTopic.id,
    },
  ];

  for (const q of adminQuestions) {
    await seedQuestion(
      q.text,
      q.type,
      q.answer,
      q.points,
      admin.id,
      q.topicId,
      q.options,
    );
  }

  for (const q of examinerQuestions) {
    await seedQuestion(
      q.text,
      q.type,
      q.answer,
      q.points,
      examiner.id,
      q.topicId,
      q.options,
    );
  }

  console.log(
    "Seeded Programming subject (JS / Web & APIs / CS Fundamentals) with 10 bank questions",
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
