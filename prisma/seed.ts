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
