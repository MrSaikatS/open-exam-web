import type { Metadata } from "next";
import { getResultDetail } from "@/server/studentExamActions";
import { ResultReview } from "@/components/Student/ResultReview";

export const metadata: Metadata = {
  title: "Result Details",
  description: "View result details",
};

const StudentResultDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const data = await getResultDetail(id);

  return (
    <section className="mx-auto grid max-w-3xl gap-6">
      <h1 className="text-2xl font-medium">{data.exam.title} — Results</h1>
      <ResultReview
        autoScore={data.autoScore}
        totalScore={data.totalScore}
        maxScore={data.maxScore}
        submittedAt={data.submittedAt?.toISOString() ?? null}
        questions={data.exam.questions}
        answers={data.answers}
      />
    </section>
  );
};

export default StudentResultDetailPage;
