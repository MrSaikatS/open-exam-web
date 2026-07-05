-- CreateTable
CREATE TABLE "exam_assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'assigned',
    CONSTRAINT "exam_assignment_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exam_assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exam_assignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "exam_assignment_examId_idx" ON "exam_assignment"("examId");

-- CreateIndex
CREATE INDEX "exam_assignment_userId_idx" ON "exam_assignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_assignment_examId_userId_key" ON "exam_assignment"("examId", "userId");
