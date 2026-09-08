import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

function EndCallButton() {
  const call = useCall();
  const router = useRouter();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const updateInterviewStatus = useMutation(api.interviews.updateInterviewStatus);
  const saveInterviewAnswers = useMutation(api.interviews.saveInterviewAnswers);

  const interview = useQuery(api.interviews.getInterviewByStreamCallId, {
    streamCallId: call?.id || "",
  });

  if (!call || !interview) return null;

  const isMeetingOwner = localParticipant?.userId === call.state.createdBy?.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    try {
      // 1. Get all coding answers from localStorage
      const codingAnswers = localStorage.getItem('codingAnswers');
      const answers = codingAnswers ? JSON.parse(codingAnswers) : null;

      // 2. End the call
      await call.endCall();

      // 3. Update interview status and save answers in parallel
      await Promise.all([
        updateInterviewStatus({
          id: interview._id,
          status: "completed",
        }),
        answers && Object.keys(answers).length > 0 && saveInterviewAnswers({
          interviewId: interview._id,
          answers: answers,
        }),
      ]);

      // 4. Clear localStorage
      localStorage.removeItem('codingAnswers');

      router.push("/");
      toast.success("Meeting ended and answers saved successfully");
    } catch (error) {
      console.error("Failed to end meeting:", error);
      toast.error("Failed to end meeting");
    }
  };

  return (
    <Button variant={"destructive"} onClick={endCall}>
      End Meeting
    </Button>
  );
}

export default EndCallButton;