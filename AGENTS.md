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

| Command         | What it does                                 | Gotcha                                                                                                                                                                           |
| --------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun dev`       | `next dev` (Turbopack)                       |                                                                                                                                                                                  |
| `bun migrate`   | `prisma migrate dev && prisma generate`      | Use this, not raw `prisma db push`. Prompts for migration name interactively.                                                                                                    |
| `bun studio`    | `prisma studio --browser none`               | Headless — open the printed URL manually                                                                                                                                         |
| `bun seed`      | `prisma db seed` (runs `tsx prisma/seed.ts`) | Seeds 4 users: admin@example.com, examiner@example.com, proctor@example.com, student@example.com (password = email). Admin email overridable via `BETTER_AUTH_SEED_ADMIN_EMAIL`. |
| `bun add`       | Bun install                                  | Works, also `bunx` for one-off commands                                                                                                                                          |
| `bun typecheck` | `tsc --noEmit`                               | Use instead of `next build` for routine TS checks                                                                                                                                |

# Prisma

- **No `datasource.url` in schema** — URL comes from `prisma.config.ts` via `env("DATABASE_URL")` (loaded with `dotenv/config`). Do not add it back inline.
- Import: `import { PrismaClient } from "@generated/prisma/client"` — there is no `@prisma/client` import.
- Singleton: `src/lib/database/dbClient.ts` — use this, never instantiate `PrismaClient` elsewhere.
- Adapter: `PrismaLibSql` — used in both `dbClient.ts` and `prisma/seed.ts`.
- Build fails without `prisma generate`. Scripts `build` and `prod` do it automatically; raw `next build` will fail.
- `generated/` is gitignored and ESLint-ignored. Do not edit generated files.
- Schema has 6 models: `User`, `Session`, `Account`, `Verification`, `Exam`, `Question`.

# Env (T3)

- `src/lib/env/serverEnv.ts` & `clientEnv.ts` — loaded as side effects in `next.config.ts`.
- `experimental__runtimeEnv: process.env` in `serverEnv.ts` — keep the `experimental__` prefix verbatim.
- `DATABASE_URL` must start with `file:./` (validated by Zod).
- New vars: add to `serverEnv.ts` (server) or `clientEnv.ts` (must be `NEXT_PUBLIC_*`) and mirror in `.env.example`.

# Auth (Better Auth)

- Configured in `src/lib/auth.ts` (server) and `src/lib/auth-client.ts` (client).
- 4 roles: `admin`, `examiner`, `proctor`, `student` (default). Custom resources: `exam` (create/read/update/delete/publish/assign), `result` (read/export/delete).
- Role layouts (`admin/layout.tsx`, etc.) check `session.user.role` server-side and redirect mismatched users.
- Login redirects client-side via `data.user.role` → `replace()` to the correct role route.
- Permission check (server): `auth.api.userHasPermission({ body: { userId, permission: { exam: ["create"] } } })`
- Permission check (client): `authClient.admin.hasPermission({ permission: { exam: ["create"] } })`
- Password reset email is a `console.log` stub — not wired to real email.
- Argon2 hashing in `src/lib/argon2.ts` — uses `BETTER_AUTH_SECRET` as secret key.

# Route structure

```
(private)/                     # Auth gate (redirects unauthenticated to /)
├── admin/                     # admin role only
│   ├── page.tsx               # Dashboard (stub)
│   ├── exams/
│   │   ├── page.tsx           # List — built
│   │   ├── new/page.tsx       # Create — built
│   │   └── [id]/
│   │       ├── page.tsx       # Detail/edit/questions — built
│   │       ├── assign/        # stub
│   │       └── results/       # stub
│   ├── results/               # stub
│   └── users/                 # stub
├── examiner/                  # examiner role only
│   └── exams/ mirrors admin   # built (list, create, detail)
├── proctor/                   # proctor role only (all stubs)
└── student/                   # student role only (all stubs)
```

`admin` and `examiner` exam CRUD pages are fully implemented. Everything else is a `<h1>` stub.

# Exam CRUD conventions

- Server actions live in `src/server/actions/exam.ts` — `"use server"`, each checks session + role ownership.
- List page fetches via `getExams()` (returns exams + `_count.questions` + `createdBy.name`).
- Create/Detail use `ExamForm` (`src/components/Exam/ExamForm.tsx`) — wrapped in `"use client"`, `react-hook-form` + `Controller` pattern.
- Questions managed via `QuestionsManager` (`src/components/Exam/QuestionsManager.tsx`) — inline add/edit/delete with `questionFormSchema`.
- `ExamsTable` (`src/components/Exam/ExamsTable.tsx`) — client component with delete/publish actions.
- Dynamic `Link` hrefs with `typedRoutes: true` require `as Route` cast — `import type { Route } from "next"`.

# Styling & formatting

- Tailwind v4: all theme config in `globals.css` via `@theme` block and `@custom-variant`. Do not create `tailwind.config.ts`.
- Prettier: `singleAttributePerLine: true`, `bracketSameLine: true`, `experimentalTernaries: true`, `prettier-plugin-tailwindcss`. Code is auto-formatted on save in most editors; match existing style.
- shadcn `Input` from `@base-ui/react/input` has strict value types — `Controller` fields with `z.coerce.number()` need explicit `value={String(field.value ?? "")}` to avoid type error.

# Zod schemas

All in `src/lib/zodSchema.ts`. Export both schema and inferred type (`==`). Current schemas: `loginFormSchema`, `registerFormSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, `examFormSchema`, `questionFormSchema`.

# Form pattern (react-hook-form + shadcn)

```typescript
const { handleSubmit, control, formState: { isSubmitting } } = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: { ... },
  mode: "all",
});

<Controller
  name="fieldName"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Label</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

Form: `<form onSubmit={handleSubmit(handler)} noValidate>`. Submit button shows spinner while `isSubmitting`.

# Path aliases

- `@/*` → `./src/*`
- `@generated/*` → `./generated/*` (Prisma client only)

# Misc

- `src/server/` — server-only modules (server actions, `import "server-only"`).
- `src/hooks/` — custom React hooks.
- Git on Windows: use PowerShell here-strings for commits.
- `.next/types/link.d.ts` is auto-generated by `next build`. Run `next build` after adding new routes to keep typed routes in sync.
- No CI, no pre-commit hooks.
