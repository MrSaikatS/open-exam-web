-- CreateTable
CREATE TABLE "subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "subjectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Seed default subject/topic so existing bank questions can be reassigned
INSERT INTO "subject" ("id", "name", "description", "order", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Uncategorized',
  'Default subject for questions without a category',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO "topic" ("id", "name", "description", "order", "subjectId", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-4000-8000-000000000002',
  'General',
  'Default topic for uncategorized questions',
  0,
  '00000000-0000-4000-8000-000000000001',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bank_question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'multiple_choice',
    "options" TEXT,
    "answer" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "topicId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bank_question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bank_question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_bank_question" ("answer", "createdAt", "createdById", "id", "options", "points", "text", "type", "updatedAt", "topicId")
SELECT "answer", "createdAt", "createdById", "id", "options", "points", "text", "type", "updatedAt", '00000000-0000-4000-8000-000000000002'
FROM "bank_question";
DROP TABLE "bank_question";
ALTER TABLE "new_bank_question" RENAME TO "bank_question";
CREATE INDEX "bank_question_createdById_idx" ON "bank_question"("createdById");
CREATE INDEX "bank_question_topicId_idx" ON "bank_question"("topicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "subject_name_key" ON "subject"("name");

-- CreateIndex
CREATE INDEX "topic_subjectId_idx" ON "topic"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "topic_subjectId_name_key" ON "topic"("subjectId", "name");
