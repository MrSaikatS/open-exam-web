-- CreateTable
CREATE TABLE "exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "exam_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'multiple_choice',
    "options" TEXT,
    "answer" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "exam_createdById_idx" ON "exam"("createdById");

-- CreateIndex
CREATE INDEX "question_examId_idx" ON "question"("examId");
