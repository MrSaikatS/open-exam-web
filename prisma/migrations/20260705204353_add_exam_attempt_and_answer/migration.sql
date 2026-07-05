-- CreateTable
CREATE TABLE "exam_attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    "autoScore" INTEGER,
    "totalScore" INTEGER,
    "maxScore" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "exam_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exam_attempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT,
    "score" INTEGER,
    CONSTRAINT "answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "exam_attempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "exam_attempt_examId_idx" ON "exam_attempt"("examId");

-- CreateIndex
CREATE INDEX "exam_attempt_userId_idx" ON "exam_attempt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempt_userId_examId_key" ON "exam_attempt"("userId", "examId");

-- CreateIndex
CREATE INDEX "answer_attemptId_idx" ON "answer"("attemptId");

-- CreateIndex
CREATE INDEX "answer_questionId_idx" ON "answer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "answer_attemptId_questionId_key" ON "answer"("attemptId", "questionId");
