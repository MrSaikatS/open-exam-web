<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Stack

- Next.js 16.2 + React 19.2, App Router, Turbopack, React Compiler on, `typedRoutes: true`
- Prisma 7 (`provider = "prisma-client"`, output `../generated/prisma`) + `@prisma/adapter-libsql` (SQLite file-backed)
- Tailwind v4 (CSS-only config in `globals.css`; **no** `tailwind.config.ts`; PostCSS plugin `@tailwindcss/postcss`)
- shadcn/ui `base-luma` style — primitives from `@base-ui/react` (not Radix). `components.json` sets `ui` → `@/components/shadcnui`
- `next-themes` (default `dark`, `enableSystem={false}`), `react-toastify`, `lucide-react`, `date-fns`
- `@t3-oss/env-nextjs` + Zod for env validation
- Better Auth 1.6 (email/password, admin plugin with 4 roles)
- Package manager: Bun (`bun.lock` committed; `node >=24`, `npm >=11` supported but scripts are Bun-first)

# Verification

- **Typecheck**: `bun typecheck` — `tsc --noEmit` (fast, use during iteration)
- **Lint**: `bun lint` — ESLint with core-web-vitals + TypeScript rules
- **Full prod**: `bun prod` — `prisma generate && eslint && next build && next start`
- Pre-commit: none. Run `bun lint && bun typecheck` before PR.

# Commands with quirks

| Command         | What it does                                 | Quirk                                                                                                                                                                                                                                                      |
| --------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun dev`       | `next dev` (Turbopack)                       |                                                                                                                                                                                                                                                            |
| `bun migrate`   | `prisma migrate dev && prisma generate`      | Use this, not raw `prisma db push`. Prompts for migration name interactively.                                                                                                                                                                              |
| `bun studio`    | `prisma studio --browser none`               | Headless — open the printed URL manually                                                                                                                                                                                                                   |
| `bun seed`      | `prisma db seed` (runs `tsx prisma/seed.ts`) | Seeds 4 users: admin@example.com, examiner@example.com, proctor@example.com, student@example.com (password = email). Admin email overridable via `BETTER_AUTH_SEED_ADMIN_EMAIL`. Also migrates existing questions to bank + seeds 8 sample bank questions. |
| `bun add`       | Bun install                                  | Works, also `bunx` for one-off commands                                                                                                                                                                                                                    |
| `bun typecheck` | `tsc --noEmit`                               | Use instead of `next build` for routine TS checks                                                                                                                                                                                                          |

# Prisma

- **No `datasource.url` in schema** — URL comes from `prisma.config.ts` via `env("DATABASE_URL")` (loaded with `dotenv/config`). Do not add it back inline.
- Import: `import { PrismaClient } from "@generated/prisma/client"` — there is no `@prisma/client` import.
- Singleton: `src/lib/database/dbClient.ts` — use this, never instantiate `PrismaClient` elsewhere.
- Adapter: `PrismaLibSql` — used in both `dbClient.ts` and `prisma/seed.ts`.
- Build fails without `prisma generate`. Scripts `build` and `prod` do it automatically; raw `next build` will fail.
- `generated/` is gitignored and ESLint-ignored.
- 10 models: User, Session, Account, Verification, Exam, ExamAssignment, **BankQuestion**, **Question**, **ExamAttempt**, **Answer**.

# Question storage (critical)

- `Question.options` and `BankQuestion.options` are **newline-separated plain text** (not JSON). Parse with `.split("\n").filter(Boolean)`.
- `Question.answer` for choice types (`multiple_choice`, `single_choice`, `true_false`): single correct option text.
- For `multiple_choice`, student answers are stored as multiple option texts joined with `\n`. The auto-grader does `normalize(text) === normalize(question.answer)` — so the correct answer must match the joined string exactly.
- `short_answer` grading uses comma-separated keywords in `question.answer`. Score = `round(points * matchCount / totalKeywords)`.
- Normalize function: `trim().toLowerCase().replace(/\s+/g, " ")`.

# Env (T3)

- `src/lib/env/serverEnv.ts` & `clientEnv.ts` — loaded as side effects in `next.config.ts`.
- `experimental__runtimeEnv: process.env` in `serverEnv.ts` — keep the `experimental__` prefix verbatim.
- `DATABASE_URL` must start with `file:./` (validated by Zod).
- New vars: add to `serverEnv.ts` (server) or `clientEnv.ts` (must be `NEXT_PUBLIC_*`) and mirror in `.env.example`.

# Auth (Better Auth)

- Configured in `src/lib/auth.ts` (server) and `src/lib/auth-client.ts` (client).
- 4 roles: `admin`, `examiner`, `proctor`, `student` (default). Custom resources: `exam` (create/read/update/delete/publish/assign), `result` (read/export/delete).
- Role layouts check `session.user.role` server-side; login redirects client-side via `data.user.role`.
- Permission check (server): `auth.api.userHasPermission({ body: { userId, permission: { exam: ["create"] } } })`
- Permission check (client): `authClient.admin.hasPermission({ permission: { exam: ["create"] } })`
- Password reset is a `console.log` stub. Argon2 hashing uses `BETTER_AUTH_SECRET` as secret key.

# Route structure

```
(private)/                  # Auth gate → redirects to / if unauthenticated
├── admin/                  # role=admin only
│   ├── page.tsx            # Dashboard (stub)
│   ├── exams/              # CRUD — implemented
│   ├── questions/          # Question bank — implemented (list, new, [id])
│   ├── results/            # stub
│   └── users/              # stub
├── examiner/               # role=examiner only
│   ├── page.tsx            # Dashboard (stub)
│   ├── exams/              # CRUD — implemented (scoped to own exams)
│   ├── questions/          # Question bank — implemented (no delete)
│   └── results/            # stub
├── proctor/                # all stubs
└── student/                # role=student only
    ├── page.tsx            # Dashboard (stub)
    ├── exams/              # List + take exam (ExamPlayer)
    └── results/            # List + detail (ResultReview)
```

# Server actions

All in `src/server/actions/`, each is `"use server"`, checks session + role ownership.

| File             | Actions                                                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `exam.ts`        | `getExams`, `getExamById`, `createExam`, `updateExam`, `deleteExam`, `publishExam`, `addQuestion`, `updateQuestion`, `deleteQuestion`                                  |
| `bank.ts`        | `getBankQuestions`, `getBankQuestionById`, `createBankQuestion`, `updateBankQuestion`, `deleteBankQuestion` (admin-only), `importBankQuestions(examId, questionIds[])` |
| `studentExam.ts` | `getStudentExams`, `startExam`, `getAttemptQuestions`, `saveAnswer`, `submitExam`, `getStudentResults`, `getResultDetail`                                              |
| `assignment.ts`  | `assignExam`, `unassignExam`, `getAssignedStudents`, `getAvailableStudents`                                                                                            |
| `results.ts`     | `getExamResults`, `getAllResults`, `getResultDetail` (admin/examiner view)                                                                                             |

# Exam CRUD conventions

- List page fetches via `getExams()` — returns exams + `_count.questions` + `createdBy.name`.
- Create/Detail use `ExamForm` (`src/components/Exam/ExamForm.tsx`) — `"use client"`, `react-hook-form` + `Controller` pattern.
- Questions use **bank-first** approach: `QuestionsManager` (`src/components/Exam/QuestionsManager.tsx`) has no inline "Add Question" form. Use the "Import from Bank" dialog to copy questions into the exam. Edit/delete work on the exam copy only.
- `ExamsTable` (`src/components/Exam/ExamsTable.tsx`) — client component with delete/publish actions.
- Dynamic `Link` hrefs with `typedRoutes: true` require `as Route` cast — `import type { Route } from "next"`. Regenerate `.next/types/link.d.ts` via `next build` after adding new routes.
- Import is Copy/Snapshot: `importBankQuestions` creates new `Question` rows duplicating all fields. No FK link to bank originals.
- Admin can delete any exam. Examiners cannot delete published exams.
- `redirect()` in a server action called from a client component can be misinterpreted as a promise rejection by `.catch()`. Prefer client-side `router.push()` after the action resolves.

# Student exam flow

- `ExamPlayer` (`src/components/Student/ExamPlayer.tsx`): renders questions via `QuestionCard`, auto-saves on answer change, auto-submits on timer expiry. Timer uses `useRef` + stable `useEffect` (empty deps) — do not add state vars to deps.
- `QuestionCard` (`src/components/Student/QuestionCard.tsx`): `multiple_choice` renders checkboxes (joined with `\n`), `single_choice`/`true_false` use radio buttons, `short_answer` is a text input.
- `ResultReview` (`src/components/Student/ResultReview.tsx`): shows per-question correct/wrong/unanswered styling. Unanswered questions get `border-muted-foreground/20 bg-muted/30`.
- `saveAnswer` server action from client: use dynamic import to avoid "Expected 2 arguments" TS error — `import("@/server/actions/studentExam").then((m) => m.saveAnswer(...))`.

# Styling & formatting

- Tailwind v4: all theme config in `globals.css` via `@theme` block. No `tailwind.config.ts`.
- Prettier: `singleAttributePerLine: true`, `bracketSameLine: true`, `experimentalTernaries: true`, `prettier-plugin-tailwindcss`. Match existing style.
- shadcn `Input` from `@base-ui/react/input` has strict value types — `Controller` fields with `z.coerce.number()` need explicit `value={String(field.value ?? "")}`.
- Prefer `variant="outline"` over `variant="ghost"`; prefer `size="lg"` over `size="sm"`, `size="icon-lg"` over `size="icon-sm"`.

# Zod schemas

All in `src/lib/zodSchema.ts`. Export both schema and inferred type (`==`). Schemas: `loginFormSchema`, `registerFormSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, `examFormSchema`, `questionFormSchema`, `createUserSchema`.

# Form pattern (react-hook-form + shadcn)

```
useForm({ resolver: zodResolver(schema), defaultValues: {...}, mode: "all" })
<Controller name="field" control={control} render={({ field, fieldState }) => (
  <Field data-invalid={fieldState.invalid}>
    <FieldLabel htmlFor={field.name}>Label</FieldLabel>
    <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
  </Field>
)} />
```

Form: `<form onSubmit={handleSubmit(handler)} noValidate>`. Submit button shows spinner while `isSubmitting`.

# Server action binding

- Use `.bind(null, ...args)` — e.g. `action={updateExam.bind(null, id)}`.
- Inline anonymous functions like `action={async (fd) => updateExam(id, fd)}` cannot be serialized across the server/client boundary.

# Path aliases

- `@/*` → `./src/*`
- `@generated/*` → `./generated/*` (Prisma client only)

# Misc

- `src/server/` — server-only modules (`import "server-only"`).
- `src/hooks/` — custom React hooks.
- No CI, no pre-commit hooks.

## Git commits

Use PowerShell here-strings:

```powershell
git commit -m @"
commit message here
"@
```
