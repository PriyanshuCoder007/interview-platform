"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface TabSwitchWarningProps {
  open: boolean;
  onClose: () => void;
  interview: Doc<"interviews">;
  onForceEndMeeting: () => Promise<void>;
  maxTabSwitches?: number;
  isCandidate: boolean;
  onExceededTabSwitches?: () => void; // Add this new prop
}

export default function TabSwitchWarning({
  open,
  onClose,
  interview,
  onForceEndMeeting,
  maxTabSwitches = 1,
  isCandidate,
  onExceededTabSwitches, // Add this new prop
}: TabSwitchWarningProps) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const saveInterviewAnswers = useMutation(api.interviews.saveInterviewAnswers);

  // Track tab visibility changes only for candidates
  useEffect(() => {
    if (!isCandidate) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        
        if (newCount === 1) {
          toast.error(`Tab switch detected (${newCount}/${maxTabSwitches})`);
        } else if (newCount > maxTabSwitches) {
          handleForceEndMeeting();
          // Notify parent component that tab switches were exceeded
          onExceededTabSwitches?.();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tabSwitchCount, maxTabSwitches, isCandidate, onExceededTabSwitches]);

  const saveCurrentProgress = async () => {
    try {
      const codingAnswers = localStorage.getItem('codingAnswers');
      const answers = codingAnswers ? JSON.parse(codingAnswers) : null;

      if (interview._id && answers) {
        await saveInterviewAnswers({
          interviewId: interview._id,
          answers
        });
      }
      return true;
    } catch (error) {
      console.error("Failed to save answers:", error);
      return false;
    }
  };

  const handleForceEndMeeting = async () => {
    await saveCurrentProgress();
    localStorage.removeItem('codingAnswers');
    await onForceEndMeeting();
  };

  const handleConfirmLeave = async () => {
    await handleForceEndMeeting();
    onClose();
  };

  const handleContinueInterview = () => {
    onClose();
  };

  return (
    <AlertDialog open={open && isCandidate}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {tabSwitchCount >= maxTabSwitches 
              ? "⚠️ Meeting Ended"
              : "⚠️ Tab Switch Detected"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {tabSwitchCount >= maxTabSwitches ? (
              "You exceeded the maximum allowed tab switches. Your progress has been saved."
            ) : (
              `Tab switches detected (${tabSwitchCount}/${maxTabSwitches}). ${
                maxTabSwitches - tabSwitchCount > 0 
                  ? `One more switch will end the meeting.` 
                  : ''
              }`
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {tabSwitchCount < maxTabSwitches ? (
            <>
              <AlertDialogAction onClick={handleContinueInterview}>
                Continue Interview
              </AlertDialogAction>
              <AlertDialogAction 
                onClick={handleConfirmLeave}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Save & Leave
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction onClick={handleForceEndMeeting}>
              OK
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}