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

  // Migrate existing inline questions to bank questions
  const existingQuestions = await prisma.question.findMany({
    include: { exam: { select: { createdById: true } } },
  });

  for (const q of existingQuestions) {
    const existingBank = await prisma.bankQuestion.findFirst({
      where: { text: q.text, type: q.type },
    });
    if (!existingBank) {
      await prisma.bankQuestion.create({
        data: {
          text: q.text,
          type: q.type,
          options: q.options,
          answer: q.answer,
          points: q.points,
          createdById: q.exam.createdById,
        },
      });
    }
  }

  // Seed sample bank questions if bank is empty
  const bankCount = await prisma.bankQuestion.count();
  if (bankCount === 0) {
    const admin = await prisma.user.findFirst({
      where: { role: "admin" },
    });
    if (!admin) return;

    const sampleQuestions = [
      {
        text: "What is the capital of France?",
        type: "single_choice",
        options: "London\nBerlin\nParis\nMadrid",
        answer: "Paris",
        points: 1,
      },
      {
        text: "Which of the following are programming languages?",
        type: "multiple_choice",
        options: "Python\nHTML\nJavaScript\nCSS",
        answer: "Python\nJavaScript",
        points: 2,
      },
      {
        text: "The Earth is flat.",
        type: "true_false",
        options: "True\nFalse",
        answer: "False",
        points: 1,
      },
      {
        text: "What is the chemical symbol for water?",
        type: "short_answer",
        options: "",
        answer: "H2O",
        points: 1,
      },
      {
        text: "What is 2 + 2?",
        type: "short_answer",
        options: "",
        answer: "4",
        points: 1,
      },
      {
        text: "Which planet is known as the Red Planet?",
        type: "single_choice",
        options: "Venus\nMars\nJupiter\nSaturn",
        answer: "Mars",
        points: 1,
      },
      {
        text: "Select all prime numbers.",
        type: "multiple_choice",
        options: "2\n4\n7\n10",
        answer: "2\n7",
        points: 2,
      },
      {
        text: "The sun rises in the west.",
        type: "true_false",
        options: "True\nFalse",
        answer: "False",
        points: 1,
      },
    ];

    for (const sq of sampleQuestions) {
      await prisma.bankQuestion.create({
        data: { ...sq, createdById: admin.id },
      });
    }

    console.log("Seeded sample bank questions");
  }
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
