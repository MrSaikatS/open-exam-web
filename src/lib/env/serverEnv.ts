import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const serverEnv = createEnv({
  server: {
    DATABASE_URL: z
      .string()
      .startsWith("file:./", {
        error: "DATABASE_URL must start with file:./",
      })
      .min(1, { error: "DATABASE_URL is required" }),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_ALLOWED_ORIGINS: z.string().optional(),
    BETTER_AUTH_TELEMETRY: z.enum(["0", "1"]).optional(),
    CHECKPOINT_DISABLE: z.enum(["1", "0"]).optional(),
  },
  experimental__runtimeEnv: process.env,
});
