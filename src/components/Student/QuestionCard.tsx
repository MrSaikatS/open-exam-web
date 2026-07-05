"use client";

import { Input } from "../shadcnui/input";
import { Textarea } from "../shadcnui/textarea";
import { Label } from "../shadcnui/label";

type QuestionCardProps = {
  question: {
    id: string;
    text: string;
    type: string;
    options: string | null;
    points: number;
  };
  value: string;
  onChange: (val: string) => void;
};

export const QuestionCard = ({
  question,
  value,
  onChange,
}: QuestionCardProps) => {
  const options =
    question.options ? (JSON.parse(question.options) as string[]) : [];

  const renderInput = () => {
    switch (question.type) {
      case "multiple_choice":
      case "single_choice":
        return (
          <div className="grid gap-3">
            {options.map((opt) => (
              <Label
                key={opt}
                className={`hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                  value === opt ?
                    "border-primary bg-primary/5"
                  : "border-border"
                }`}>
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => onChange(e.target.value)}
                  className="accent-primary size-4"
                />
                <span>{opt}</span>
              </Label>
            ))}
          </div>
        );

      case "true_false":
        return (
          <div className="flex gap-4">
            {["True", "False"].map((opt) => (
              <Label
                key={opt}
                className={`hover:bg-accent flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                  value === opt ?
                    "border-primary bg-primary/5"
                  : "border-border"
                }`}>
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => onChange(e.target.value)}
                  className="accent-primary size-4"
                />
                <span>{opt}</span>
              </Label>
            ))}
          </div>
        );

      case "short_answer":
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer..."
          />
        );

      default:
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer..."
            rows={4}
          />
        );
    }
  };

  return (
    <div className="grid gap-4 rounded-lg border p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-lg leading-relaxed font-medium">{question.text}</p>
        <span className="bg-muted shrink-0 rounded-full px-3 py-1 text-xs font-medium tabular-nums">
          {question.points} {question.points === 1 ? "pt" : "pts"}
        </span>
      </div>
      {renderInput()}
    </div>
  );
};
