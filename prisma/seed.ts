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
      // --- General Knowledge (10) ---
      {
        text: "What is the capital of France?",
        type: "single_choice",
        options: "London\nBerlin\nParis\nMadrid",
        answer: "Paris",
        points: 1,
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
        answer: "H2O",
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
        text: "What is the largest ocean on Earth?",
        type: "single_choice",
        options: "Atlantic\nIndian\nPacific\nArctic",
        answer: "Pacific",
        points: 1,
      },
      {
        text: "Which of the following are fruit?",
        type: "multiple_choice",
        options: "Apple\nCarrot\nBanana\nBroccoli",
        answer: "Apple\nBanana",
        points: 2,
      },
      {
        text: "Light travels faster than sound.",
        type: "true_false",
        options: "True\nFalse",
        answer: "True",
        points: 1,
      },
      {
        text: "Who wrote 'Romeo and Juliet'?",
        type: "short_answer",
        answer: "William Shakespeare",
        points: 2,
      },
      {
        text: "What is the powerhouse of the cell?",
        type: "single_choice",
        options: "Nucleus\nMitochondria\nRibosome\nGolgi apparatus",
        answer: "Mitochondria",
        points: 1,
      },
      {
        text: "The Great Wall of China is visible from space.",
        type: "true_false",
        options: "True\nFalse",
        answer: "False",
        points: 1,
      },
      // --- Programming (10) ---
      {
        text: "Which of the following are programming languages?",
        type: "multiple_choice",
        options: "Python\nHTML\nJavaScript\nCSS",
        answer: "Python\nJavaScript",
        points: 2,
      },
      {
        text: "What does SQL stand for?",
        type: "single_choice",
        options:
          "Simple Query Language\nStructured Query Language\nStandard Question Language\nSequential Query Logic",
        answer: "Structured Query Language",
        points: 1,
      },
      {
        text: "What is 2 + 2 in JavaScript?",
        type: "short_answer",
        answer: "4",
        points: 1,
      },
      {
        text: "A variable declared with 'const' cannot be reassigned.",
        type: "true_false",
        options: "True\nFalse",
        answer: "True",
        points: 1,
      },
      {
        text: "Which data structure uses LIFO order?",
        type: "single_choice",
        options: "Queue\nStack\nArray\nLinked List",
        answer: "Stack",
        points: 1,
      },
      {
        text: "Which of the following are relational databases?",
        type: "multiple_choice",
        options: "PostgreSQL\nMongoDB\nMySQL\nRedis",
        answer: "PostgreSQL\nMySQL",
        points: 2,
      },
      {
        text: "What does API stand for?",
        type: "short_answer",
        answer: "Application Programming Interface",
        points: 2,
      },
      {
        text: "In Python, 'len()' returns the length of a sequence.",
        type: "true_false",
        options: "True\nFalse",
        answer: "True",
        points: 1,
      },
      {
        text: "Which language is primarily used for styling web pages?",
        type: "single_choice",
        options: "HTML\nJavaScript\nCSS\nPython",
        answer: "CSS",
        points: 1,
      },
      {
        text: "Which of the following are version control systems?",
        type: "multiple_choice",
        options: "Git\nSVN\nDocker\nMercurial",
        answer: "Git\nSVN\nMercurial",
        points: 2,
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
