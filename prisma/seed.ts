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

  const seedQuestion = async (
    text: string,
    type: string,
    answer: string,
    points: number,
    createdById: string,
    options?: string,
  ) => {
    const existing = await prisma.bankQuestion.findFirst({
      where: { text, type, createdById },
    });

    if (existing) {
      await prisma.bankQuestion.update({
        where: { id: existing.id },
        data: { text, type, options: options ?? null, answer, points },
      });
    } else {
      await prisma.bankQuestion.create({
        data: {
          text,
          type,
          options: options ?? null,
          answer,
          points,
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
  }[] = [
    {
      text: "Which of the following are primitive data types in JavaScript?",
      type: "multiple_choice",
      options: "String\nNumber\nObject\nBoolean\nArray",
      answer: "String\nNumber\nBoolean",
      points: 2,
    },
    {
      text: "What does the 'this' keyword refer to in a JavaScript arrow function?",
      type: "single_choice",
      options:
        "The function itself\nThe global object\nThe enclosing lexical context\nThe new instance",
      answer: "The enclosing lexical context",
      points: 2,
    },
    {
      text: "TypeScript is a superset of JavaScript that adds optional static typing.",
      type: "true_false",
      options: "True\nFalse",
      answer: "True",
      points: 1,
    },
    {
      text: "What does REST stand for in web API design?",
      type: "short_answer",
      answer: "Representational, State, Transfer",
      points: 2,
    },
    {
      text: "Which time complexity does an efficient sorting algorithm like merge sort have?",
      type: "single_choice",
      options: "O(n)\nO(n²)\nO(n log n)\nO(log n)",
      answer: "O(n log n)",
      points: 2,
    },
  ];

  const examinerQuestions: {
    text: string;
    type: string;
    options?: string;
    answer: string;
    points: number;
  }[] = [
    {
      text: "In OOP, encapsulation refers to bundling data with the methods that operate on it.",
      type: "true_false",
      options: "True\nFalse",
      answer: "True",
      points: 1,
    },
    {
      text: "Which design pattern ensures a class has only one instance?",
      type: "single_choice",
      options: "Factory\nObserver\nSingleton\nDecorator",
      answer: "Singleton",
      points: 2,
    },
    {
      text: "What Git command is used to temporarily save uncommitted changes?",
      type: "short_answer",
      answer: "stash",
      points: 1,
    },
    {
      text: "Which of the following are JavaScript runtime environments?",
      type: "multiple_choice",
      options: "Node.js\nDeno\nPython\nBun",
      answer: "Node.js\nDeno\nBun",
      points: 2,
    },
    {
      text: "What does ACID stand for in database transactions?",
      type: "single_choice",
      options:
        "Atomicity, Consistency, Isolation, Durability\nAvailability, Consistency, Isolation, Durability\nAtomicity, Consistency, Integrity, Durability\nAtomicity, Control, Isolation, Distribution",
      answer: "Atomicity, Consistency, Isolation, Durability",
      points: 2,
    },
  ];

  for (const q of adminQuestions) {
    await seedQuestion(q.text, q.type, q.answer, q.points, admin.id, q.options);
  }

  for (const q of examinerQuestions) {
    await seedQuestion(
      q.text,
      q.type,
      q.answer,
      q.points,
      examiner.id,
      q.options,
    );
  }

  console.log("Seeded 10 programming bank questions (5 admin, 5 examiner)");
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
