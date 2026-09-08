import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import toast from "react-hot-toast";

interface CodingQuestion {
  _id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

interface Quiz {
  category: string;
  difficulty: string;
}

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = typeof DIFFICULTIES[number];

const QUESTIONS_REQUIRED: Partial<Record<Difficulty, number>> = {
  easy: 1,
  medium: 1,
};

export function useInterviewScheduling() {
  const client = useStreamVideoClient();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<CodingQuestion[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy");
  const [quizCategories, setQuizCategories] = useState<string[]>([]);
  const [quizDifficulties, setQuizDifficulties] = useState<string[]>([]);

  const interviews = useQuery(api.interviews.getAllInterviews) ?? [];
  const users = useQuery(api.users.getUsers) ?? [];
  const allQuestions = useQuery(api.codingQuestions.getQuestions) ?? [];
  const createInterview = useMutation(api.interviews.createInterview);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: new Date(),
    time: "09:00",
    candidateId: "",
    interviewerIds: user?.id ? [user.id] : [],
    quizCategory: "",
    quizDifficulty: "",
  });

  useEffect(() => {
    fetch("/quiz/MERN.json")
      .then((res) => res.json())
      .then((data: { quizzes: Quiz[] }) => {
        const quizzes = data.quizzes || [];
        setQuizCategories(Array.from(new Set(quizzes.map((q) => q.category))));
        setQuizDifficulties(
          Array.from(new Set(quizzes.map((q) => q.difficulty.toLowerCase())))
        );
      });
  }, []);

  const candidates = users?.filter((u) => u.role === "candidate") ?? [];
  const interviewers = users?.filter((u) => u.role === "interviewer") ?? [];

  const scheduleMeeting = async () => {
    if (!client || !user) {
      toast.error("Stream client or user not initialized");
      return;
    }

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Name and description are required");
      return;
    }

    if (!formData.candidateId || formData.interviewerIds.length === 0) {
      toast.error("Please select both candidate and at least one interviewer");
      return;
    }

    if (selectedQuestions.length < 2) {
      toast.error("Please select at least 2 questions (1 easy and 1 medium)");
      return;
    }

    if (!formData.quizCategory || !formData.quizDifficulty) {
      toast.error("Please select quiz category and difficulty");
      return;
    }

    setIsCreating(true);

    try {
      const { date, time, candidateId, interviewerIds, name, description } = formData;
      const [hours, minutes] = time.split(":");
      const meetingDate = new Date(date);
      meetingDate.setHours(parseInt(hours), parseInt(minutes), 0);

      const id = crypto.randomUUID();
      const call = client.call("default", id);

      await call.getOrCreate({
        data: {
          starts_at: meetingDate.toISOString(),
          custom: {
            description: name,
            additionalDetails: description,
          },
        },
      });

      await createInterview({
        title: name,
        description,
        startTime: meetingDate.getTime(),
        status: "upcoming",
        streamCallId: id,
        candidateId,
        interviewerIds,
        quizCategory: formData.quizCategory,
        quizDifficulty: formData.quizDifficulty,
        codingQuestions: selectedQuestions.map((q) => ({
          id: q._id as Id<"codingQuestions">,
          title: q.title,
          difficulty: q.difficulty,
        })),
      });

      setOpen(false);
      toast.success("Meeting scheduled successfully!");
      resetForm();
      return true;
    } catch (error) {
      console.error("scheduleMeeting: Failed to schedule meeting:", error);
      toast.error(`Failed to schedule meeting`);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      date: new Date(),
      time: "09:00",
      candidateId: "",
      interviewerIds: user?.id ? [user.id] : [],
      quizCategory: "",
      quizDifficulty: "",
    });
    setSelectedQuestions([]);
    setSelectedDifficulty("easy");
  };

  const addInterviewer = (interviewerId: string) => {
    if (!formData.interviewerIds.includes(interviewerId)) {
      setFormData((prev) => ({
        ...prev,
        interviewerIds: [...prev.interviewerIds, interviewerId],
      }));
    }
  };

  const removeInterviewer = (interviewerId: string) => {
    if (interviewerId === user?.id) return;
    setFormData((prev) => ({
      ...prev,
      interviewerIds: prev.interviewerIds.filter((id) => id !== interviewerId),
    }));
  };

  const toggleQuestion = (question: CodingQuestion) => {
    setSelectedQuestions((prev) => {
      const isSelected = prev.some((q) => q._id === question._id);
      if (isSelected) {
        return prev.filter((q) => q._id !== question._id);
      } else {
        const hasDifficulty = prev.some((q) => q.difficulty === question.difficulty);
        if (hasDifficulty && QUESTIONS_REQUIRED[question.difficulty] === 1) {
          toast.error(`You can only select one ${question.difficulty} question`);
          return prev;
        }
        return [...prev, question];
      }
    });
  };

  const getQuestionsByDifficulty = (difficulty: Difficulty) => {
    return allQuestions.filter((q) => q.difficulty === difficulty);
  };

  const selectedInterviewers = interviewers.filter((i) =>
    formData.interviewerIds.includes(i.clerkId)
  );

  const availableInterviewers = interviewers.filter(
    (i) => !formData.interviewerIds.includes(i.clerkId)
  );

  return {
    // State
    open,
    setOpen,
    isCreating,
    formData,
    setFormData,
    selectedQuestions,
    selectedDifficulty,
    setSelectedDifficulty,
    quizCategories,
    quizDifficulties,
    interviews,
    candidates,
    interviewers,
    selectedInterviewers,
    availableInterviewers,
    user,
    
    // Functions
    scheduleMeeting,
    resetForm,
    addInterviewer,
    removeInterviewer,
    toggleQuestion,
    getQuestionsByDifficulty,
  };
}