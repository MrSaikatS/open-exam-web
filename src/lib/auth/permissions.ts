import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  exam: ["create", "read", "update", "delete", "publish", "assign"] as const,
  result: ["read", "export", "delete"] as const,
} as const;

const ac = createAccessControl(statement);

const administrator = ac.newRole({
  exam: ["create", "read", "update", "delete", "publish", "assign"],
  result: ["read", "export", "delete"],
  ...adminAc.statements,
});

const examiner = ac.newRole({
  exam: ["create", "read", "update"],
  result: ["read", "export"],
});

const proctor = ac.newRole({
  exam: ["read"],
  result: ["read"],
  session: ["list"],
});

const student = ac.newRole({});

export { ac, administrator, examiner, proctor, student, statement };
