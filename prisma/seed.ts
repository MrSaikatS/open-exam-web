import "dotenv/config";
import { hash as argon2Hash } from "@node-rs/argon2";
import prisma from "../src/lib/database/dbClient";
import { serverEnv } from "../src/lib/env/serverEnv";

async function main() {
  const email = serverEnv.BETTER_AUTH_SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = email;

  const hashedPassword = await argon2Hash(password, {
    secret: Buffer.from(serverEnv.BETTER_AUTH_SECRET),
  });

  // Clean up any accounts with the old providerId "email" (pre-v1.7 Better Auth)
  await prisma.account.deleteMany({
    where: { providerId: "email" },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "administrator",
      emailVerified: true,
    },
    create: {
      email,
      name: "Administrator",
      role: "administrator",
      emailVerified: true,
    },
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

  console.log(`Seeded admin user: ${email}`);
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
