import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import {
  ac,
  administrator,
  examiner,
  proctor,
  student,
} from "./auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields(),
    adminClient({
      ac,
      roles: {
        administrator,
        examiner,
        proctor,
        student,
      },
    }),
  ],
});
