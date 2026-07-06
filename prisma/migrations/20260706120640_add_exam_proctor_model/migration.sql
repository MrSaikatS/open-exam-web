-- CreateTable
CREATE TABLE "exam_proctor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "proctorId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exam_proctor_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exam_proctor_proctorId_fkey" FOREIGN KEY ("proctorId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exam_proctor_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "exam_proctor_examId_idx" ON "exam_proctor"("examId");

-- CreateIndex
CREATE INDEX "exam_proctor_proctorId_idx" ON "exam_proctor"("proctorId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_proctor_examId_proctorId_key" ON "exam_proctor"("examId", "proctorId");
