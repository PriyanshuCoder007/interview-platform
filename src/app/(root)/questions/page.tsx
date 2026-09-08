"use client";

import LoaderUI from "@/components/LoaderUI";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { QuestionManagementUI } from "./QuestionManagementUI";

function QuestionsPage() {
  const router = useRouter();
  const { isInterviewer, isLoading } = useUserRole();

  if (isLoading) return <LoaderUI />;
  if (!isInterviewer) return router.push("/");

  return <QuestionManagementUI />;
}

export default QuestionsPage;