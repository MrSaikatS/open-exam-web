"use client";

import {
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  Loader2Icon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { saveAnswer, submitExam } from "@/server/actions/studentExam";
import { Button } from "../shadcnui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcnui/dialog";
import { QuestionCard } from "./QuestionCard";

type Question = {
  id: string;
  text: string;
  type: string;
  options: string | null;
  answer: string | null;
  points: number;
  order: number;
};

type SavedAnswer = {
  questionId: string;
  text: string | null;
};

type ExamPlayerProps = {
  attemptId: string;
  examTitle: string;
  duration: number;
  startedAt: string;
  questions: Question[];
  savedAnswers: SavedAnswer[];
};

export const ExamPlayer = ({
  attemptId,
  examTitle,
  duration,
  startedAt,
  questions,
  savedAnswers,
}: ExamPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const a of savedAnswers) {
      if (a.text) map[a.questionId] = a.text;
    }
    return map;
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const savingRef = useRef(false);

  const currentQuestion = questions[currentIndex];

  const saveCurrentAnswer = useCallback(async () => {
    if (!currentQuestion || savingRef.current) return;
    savingRef.current = true;
    try {
      await saveAnswer(
        attemptId,
        currentQuestion.id,
        answers[currentQuestion.id] ?? "",
      );
    } catch {
      toast.error("Failed to save answer");
    } finally {
      savingRef.current = false;
    }
  }, [attemptId, currentQuestion, answers]);

  const handleSubmit = useCallback(async () => {
    setAutoSubmitted(true);
    setSubmitting(true);
    try {
      await saveCurrentAnswer();
      await submitExam(attemptId);
    } catch {
      toast.error("Failed to submit exam");
      setSubmitting(false);
    }
  }, [attemptId, saveCurrentAnswer]);

  useEffect(() => {
    const endTimeMs = new Date(startedAt).getTime() + duration * 60 * 1000;
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((endTimeMs - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleSubmit();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [handleSubmit, startedAt, duration]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const goTo = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    saveCurrentAnswer();
    setCurrentIndex(index);
  };

  if (timeLeft === 0 && !submitting && autoSubmitted) {
    return (
      <section className="grid place-items-center gap-4 py-20">
        <AlertTriangleIcon className="text-destructive size-12" />
        <h1 className="text-2xl font-medium">Time&apos;s up!</h1>
        <p className="text-muted-foreground">Your exam has been submitted.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-3xl gap-6">
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h1 className="text-2xl font-medium">{examTitle}</h1>
          <p className="text-muted-foreground text-sm">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-lg font-medium tabular-nums ${
            timeLeft < 120 ?
              "text-destructive bg-destructive/10 animate-pulse"
            : "bg-muted"
          }`}>
          <ClockIcon className="size-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => {
          const isAnswered =
            answers[q.id] !== undefined && answers[q.id] !== "";
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => goTo(i)}
              className={`flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                isCurrent ?
                  "ring-ring bg-primary text-primary-foreground ring-2"
                : isAnswered ?
                  "bg-primary/10 text-foreground border-border border"
                : "bg-muted text-muted-foreground border-border hover:bg-accent border"
              }`}>
              {i + 1}
            </button>
          );
        })}
      </div>

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          value={answers[currentQuestion.id] ?? ""}
          onChange={(val: string) =>
            setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))
          }
        />
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}>
          <ChevronLeftIcon className="size-4" /> Previous
        </Button>

        {currentIndex < questions.length - 1 ?
          <Button
            size="lg"
            onClick={() => goTo(currentIndex + 1)}>
            Next <ChevronRightIcon className="size-4" />
          </Button>
        : <Dialog>
            <DialogTrigger
              render={
                <Button
                  size="lg"
                  variant="default"
                  disabled={submitting}>
                  {submitting ?
                    <>
                      <Loader2Icon className="size-4 animate-spin" />{" "}
                      Submitting...
                    </>
                  : "Submit Exam"}
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Exam</DialogTitle>
                <DialogDescription>
                  Are you sure you want to submit? You won&apos;t be able to
                  change your answers after submission.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <DialogClose
                  render={
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={submitting}>
                      {submitting ?
                        <>
                          <Loader2Icon className="size-4 animate-spin" />{" "}
                          Submitting...
                        </>
                      : "Yes, Submit"}
                    </Button>
                  }
                />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      </div>
    </section>
  );
};
