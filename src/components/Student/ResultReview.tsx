"use client";

import { CheckCircle2Icon, XCircleIcon, MinusCircleIcon } from "lucide-react";

type Answer = {
  id: string;
  questionId: string;
  text: string | null;
  score: number | null;
};

type Question = {
  id: string;
  text: string;
  type: string;
  options: string | null;
  answer: string | null;
  points: number;
};

type ResultReviewProps = {
  autoScore: number | null;
  totalScore: number | null;
  maxScore: number;
  submittedAt: string | null;
  questions: Question[];
  answers: Answer[];
};

export const ResultReview = ({
  autoScore,
  totalScore,
  maxScore,
  submittedAt,
  questions,
  answers,
}: ResultReviewProps) => {
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));
  const answeredCount = answers.filter((a) => a.text && a.text.trim()).length;
  const awardedScore = totalScore ?? autoScore ?? 0;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-lg border p-6 sm:grid-cols-3">
        <div className="text-center">
          <p className="text-3xl font-bold tabular-nums">
            {awardedScore}/{maxScore}
          </p>
          <p className="text-muted-foreground text-sm">Score</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold tabular-nums">
            {Math.round((awardedScore / Math.max(maxScore, 1)) * 100)}%
          </p>
          <p className="text-muted-foreground text-sm">Percentage</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold tabular-nums">
            {answeredCount}/{questions.length}
          </p>
          <p className="text-muted-foreground text-sm">Answered</p>
        </div>
      </div>

      {submittedAt && (
        <p className="text-muted-foreground text-sm">
          Submitted at {new Date(submittedAt).toLocaleString()}
        </p>
      )}

      <div className="grid gap-4">
        <h2 className="text-lg font-medium">Answer Review</h2>
        {questions.map((q, i) => {
          const answer = answerMap.get(q.id);
          const correctAnswer = q.answer ?? "";
          const studentAnswer = answer?.text ?? "";
          const score = answer?.score ?? 0;
          const isCorrect = score >= q.points;
          const isPartial = score > 0 && score < q.points;

          return (
            <div
              key={q.id}
              className={`grid gap-3 rounded-lg border p-5 ${
                isCorrect ?
                  "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
                : isPartial ?
                  "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                : studentAnswer ?
                  "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
                : "border-border"
              }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {i + 1}
                  </span>
                  <p className="font-medium">{q.text}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isCorrect ?
                    <CheckCircle2Icon className="size-5 text-emerald-600" />
                  : isPartial ?
                    <MinusCircleIcon className="size-5 text-amber-600" />
                  : studentAnswer ?
                    <XCircleIcon className="size-5 text-red-600" />
                  : <MinusCircleIcon className="text-muted-foreground size-5" />
                  }
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {score}/{q.points}
                  </span>
                </div>
              </div>

              <div className="grid gap-2 pl-10">
                {q.type !== "true_false" &&
                  q.type !== "short_answer" &&
                  q.options && (
                    <div className="grid gap-1">
                      {(JSON.parse(q.options) as string[]).map((opt) => {
                        const isSelected = studentAnswer === opt;
                        const isRight = correctAnswer === opt;
                        const isWrong = isSelected && !isRight;
                        return (
                          <div
                            key={opt}
                            className={`rounded px-3 py-1.5 text-sm ${
                              isRight ?
                                "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : isWrong ?
                                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : "text-muted-foreground"
                            }`}>
                            {opt}
                            {isRight && (
                              <span className="ml-2 text-xs">
                                (Correct answer)
                              </span>
                            )}
                            {isWrong && (
                              <span className="ml-2 text-xs">
                                (Your answer)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                {q.type === "true_false" && (
                  <div className="flex gap-4">
                    {["True", "False"].map((opt) => {
                      const isSelected = studentAnswer === opt;
                      const isRight = correctAnswer === opt;
                      const isWrong = isSelected && !isRight;
                      return (
                        <div
                          key={opt}
                          className={`rounded px-3 py-1.5 text-sm ${
                            isRight ?
                              "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : isWrong ?
                              "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : "text-muted-foreground"
                          }`}>
                          {opt}
                          {isRight && (
                            <span className="ml-2 text-xs">(Correct)</span>
                          )}
                          {isWrong && (
                            <span className="ml-2 text-xs">(You)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === "short_answer" && (
                  <div className="grid gap-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Your answer:{" "}
                      </span>
                      <span
                        className={
                          studentAnswer ? "" : "text-muted-foreground italic"
                        }>
                        {studentAnswer || "No answer"}
                      </span>
                    </div>
                    {correctAnswer && (
                      <div>
                        <span className="text-muted-foreground">
                          Expected keywords:{" "}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {!studentAnswer && q.type !== "short_answer" && (
                  <p className="text-muted-foreground text-sm italic">
                    No answer given
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
