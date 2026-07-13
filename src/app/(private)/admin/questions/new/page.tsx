import { redirect } from "next/navigation";
import { getBankHierarchy } from "@/server/bankActions";

/** Legacy /questions/new → first available topic or bank root */
const LegacyNewQuestionRedirect = async () => {
  const hierarchy = await getBankHierarchy();
  const firstTopic = hierarchy.find((s) => s.topics.length > 0)?.topics[0];
  if (firstTopic) {
    redirect(`/admin/questions/topics/${firstTopic.id}/new`);
  }
  redirect("/admin/questions");
};

export default LegacyNewQuestionRedirect;
