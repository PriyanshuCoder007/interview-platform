import { LANGUAGES } from "@/constants";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useCall } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type ProgrammingLanguage = "javascript" | "python" | "java";
type UserCodeStorage = Record<string, Partial<Record<ProgrammingLanguage, string>>>;

interface CodeExample {
  input: string;
  output: string;
  explanation?: string;
}

interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  examples: CodeExample[];
  constraints?: string[];
  starterCode?: Partial<Record<ProgrammingLanguage, string>>;
  difficulty?: "easy" | "medium" | "hard";
}

interface CodeEditorProps {
  interviewId?: Id<"interviews">;
}

export function useCodingEditor({ interviewId }: CodeEditorProps) {
  // Stream.io call
  const call = useCall();
  const router = useRouter();

  // Data fetching
  const interview = useQuery(api.interviews.getInterviewById, interviewId ? { interviewId } : "skip");
  const allCodingQuestions = useQuery(api.codingQuestions.getQuestions);
  const getAnswers = useQuery(api.interviews.getInterviewAnswers, interviewId ? { interviewId } : "skip");
  const updateInterviewStatus = useMutation(api.interviews.updateInterviewStatus);
  const saveAnswer = useMutation(api.interviews.saveInterviewAnswers);

  // Derived state
  const scheduledQuestions = interview?.codingQuestions
    ? allCodingQuestions?.filter((q) => {
        return interview.codingQuestions?.some(
          (scheduled) => scheduled.title === q.title
        );
      }) ?? []
    : [];

  // State
  const [language, setLanguage] = useState<ProgrammingLanguage>(LANGUAGES[0].id);
  const [selectedQuestion, setSelectedQuestion] = useState<CodingQuestion | null>(null);
  const [code, setCode] = useState("");
  const [userCodes, setUserCodes] = useState<UserCodeStorage>({});
  const [isSaving, setIsSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40 * 60); 
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize selected question
  useEffect(() => {
    if (scheduledQuestions.length > 0 && !selectedQuestion) {
      setSelectedQuestion(scheduledQuestions[0]);
    }
  }, [scheduledQuestions, selectedQuestion]);

  // Load saved codes
  useEffect(() => {
    const loadSavedCodes = () => {
      try {
        if (getAnswers && typeof getAnswers === "object") {
          setUserCodes(getAnswers as UserCodeStorage);
        }

        const localCodes = localStorage.getItem("codingAnswers");
        if (localCodes) {
          const parsedLocalCodes = JSON.parse(localCodes) as UserCodeStorage;
          setUserCodes(prev => ({ ...prev, ...parsedLocalCodes }));
        }
      } catch (error) {
        console.error("Failed to load saved codes:", error);
      }
    };

    if (interviewId) {
      loadSavedCodes();
    }
  }, [getAnswers, interviewId]);

  // Update code when question or language changes
  useEffect(() => {
    if (selectedQuestion) {
      const savedCode = userCodes[selectedQuestion.id]?.[language];
      setCode(savedCode || selectedQuestion.starterCode?.[language] || "");
    }
  }, [selectedQuestion, language, userCodes]);

  // Timer logic
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  // Handlers
  const handleQuestionChange = (questionId: string) => {
    const question = scheduledQuestions.find(q => q.id === questionId);
    if (question) {
      // Save current code before switching
      if (selectedQuestion) {
        const updatedCodes = {
          ...userCodes,
          [selectedQuestion.id]: {
            ...userCodes[selectedQuestion.id],
            [language]: code
          }
        };
        setUserCodes(updatedCodes);
        localStorage.setItem("codingAnswers", JSON.stringify(updatedCodes));
      }

      // Switch to new question
      setSelectedQuestion(question);
      const newCode = userCodes[questionId]?.[language] || 
                     question.starterCode?.[language] || 
                     "";
      setCode(newCode);
    }
  };

  const handleLanguageChange = (newLanguage: ProgrammingLanguage) => {
    setLanguage(newLanguage);
  };

  const handleCodeChange = async (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);

    if (!selectedQuestion) return;

    const updatedCodes = {
      ...userCodes,
      [selectedQuestion.id]: {
        ...userCodes[selectedQuestion.id],
        [language]: newCode
      }
    };

    setUserCodes(updatedCodes);
    localStorage.setItem("codingAnswers", JSON.stringify(updatedCodes));
    await saveToDatabase(updatedCodes);
  };

  const saveToDatabase = async (codes: UserCodeStorage) => {
    if (!interviewId) return;
    setIsSaving(true);
    try {
      await saveAnswer({
        interviewId,
        answers: codes,
      });
    } catch (error) {
      console.error("Error saving to database:", error);
    } finally {
      setIsSaving(false);
    }
  };

// handleFinalSubmit to just use saveAnswer:
const handleFinalSubmit = async () => {
  if (!interviewId || !call || isSubmitted || !interview) return;

  setIsSaving(true);
  try {
    if (selectedQuestion) {
      const updatedCodes = {
        ...userCodes,
        [selectedQuestion.id]: {
          ...userCodes[selectedQuestion.id],
          [language]: code
        }
      };
      setUserCodes(updatedCodes);
      localStorage.setItem("codingAnswers", JSON.stringify(updatedCodes));

      await Promise.all([
        // Save the code answers
        Object.keys(updatedCodes).length > 0 && saveAnswer({
          interviewId,
          answers: updatedCodes,
        }),
        
        updateInterviewStatus({
          id: interview._id, 
          status: "completed",
        }),
        // End the video call
        call.endCall(),
      ]);

      // Clear local storage
      localStorage.removeItem("codingAnswers");
      
      // Update state and redirect
      setIsSubmitted(true);
      router.push("/");
      toast.success("Interview submitted and meeting ended successfully");
    }
  } catch (error) {
    console.error("Error submitting interview:", error);
    toast.error("Failed to submit interview");
  } finally {
    setIsSaving(false);
  }
};

  // Save on unmount
  useEffect(() => {
    return () => {
      if (Object.keys(userCodes).length > 0 && !isSubmitted) {
        saveToDatabase(userCodes);
      }
    };
  }, [interviewId, userCodes, isSubmitted]);

  // Loading states
  const isLoading = !allCodingQuestions;
  const noQuestions = interview && scheduledQuestions.length === 0;
  const noSelectedQuestion = !selectedQuestion;

  // Format time left
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // State
    language,
    code,
    selectedQuestion,
    scheduledQuestions,
    isSaving,
    isLoading,
    noQuestions,
    noSelectedQuestion,
    timeLeft,
    isSubmitted,
    formattedTime: formatTime(timeLeft),
    
    // Handlers
    handleQuestionChange,
    handleLanguageChange,
    handleCodeChange,
    handleFinalSubmit,
    
    // Data
    interview,
    allCodingQuestions,
    userCodes
  };
}