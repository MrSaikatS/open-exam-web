import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { ac, adminRole, examiner, proctor, student } from "./auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields(),
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        examiner,
        proctor,
        student,
      },
    }),
  ],
});
