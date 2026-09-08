import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { ClockIcon } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import toast from "react-hot-toast";

interface QuizQuestion {
  id: number;
  question: string;
  answers: { [key: string]: string | null };
  correct_answers: { [key: string]: boolean | string } | null;
  multiple_correct_answers: string;
  tags: { name: string }[];
  difficulty: string;
  category: string;
}

interface UserAnswer {
  questionId: number;
  questionTitle: string;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  selectedAnswerKey?: string | null; 
  correctAnswerKey?: string | null;   
}

interface QuizComponentProps {
  interviewId: Id<"interviews">;
  onQuizComplete: () => void;
}

const QUESTION_TIME_SECONDS = 21 * 60; 
const FINAL_QUESTIONS_LIMIT = 20;

function QuizComponent({ interviewId, onQuizComplete }: QuizComponentProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveQuizResults = useMutation(api.quizzes.submitQuiz);
  const interview = useQuery(api.interviews.getInterviewById, { interviewId });

  useEffect(() => {
    const fetchQuizFromJson = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!interview) {
          throw new Error("Interview data not found.");
        }

        const { quizCategory, quizDifficulty } = interview;


        if (!quizCategory || !quizDifficulty) {
          throw new Error("Quiz category or difficulty not defined.");
        }

        const res = await fetch("/quiz/MERN.json");
        if (!res.ok) {
          throw new Error(`Failed to fetch quiz: ${res.statusText}`);
        }

        const data = await res.json();
        const allQuestions: QuizQuestion[] = data.quizzes || [];


        if (allQuestions.length === 0) {
          throw new Error("No quizzes found in MERN.json.");
        }

        const filtered = allQuestions.filter(
          (q) =>
            q.category?.trim().toLowerCase() === quizCategory.trim().toLowerCase() &&
            q.difficulty?.trim().toLowerCase() === quizDifficulty.trim().toLowerCase()
        );

        if (filtered.length === 0) {
          throw new Error(
            `No questions found for category "${quizCategory}" and difficulty "${quizDifficulty}".`
          );
        }

        const shuffled = filtered.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, FINAL_QUESTIONS_LIMIT);

        setQuestions(selected);
        setUserAnswers(
            selected.map((q) => {
              const correctKey = q.correct_answers
                ? Object.keys(q.correct_answers).find(
                    (key) => q.correct_answers?.[key] === true || q.correct_answers?.[key] === "true"
                  )
                : null;

              const answerKey = correctKey?.replace("_correct", "") || null;
              const correctAnswerText = answerKey && q.answers ? q.answers[answerKey] : null;

              return {
                questionId: q.id,
                questionTitle: q.question,
                selectedAnswer: null,
                selectedAnswerKey: null,   
                correctAnswer: correctAnswerText,
                correctAnswerKey: answerKey, 
              };
            })
          );
        setIsLoading(false);
      } catch {
          console.error("Quiz load error");
          setError("Failed to load quiz.");
          setIsLoading(false);
      }
    };

    if (interview) fetchQuizFromJson();
  }, [interview]);

  useEffect(() => {
    if (isSubmitted || isLoading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isLoading]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

 const handleAnswerSelect = (answerKey: string) => {
  if (isSubmitted) return;

  const updatedAnswers = [...userAnswers];
  const answerText = questions[currentQuestionIndex]?.answers?.[answerKey] || null;

  updatedAnswers[currentQuestionIndex] = {
    ...updatedAnswers[currentQuestionIndex],
    selectedAnswerKey: answerKey,
    selectedAnswer: answerText,
  };

  setUserAnswers(updatedAnswers);
};


  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswers.every((answer) => answer.selectedAnswer !== null)) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitted(true);
    try {
      await saveQuizResults({ interviewId, answers: userAnswers });
      onQuizComplete();
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit quiz. Please try again.");
      setIsSubmitted(false);
      toast.error(`Failed to submit quiz: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading quiz questions...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">No questions available.</div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answerKeys = Object.keys(currentQuestion.answers).filter(
    (key) => currentQuestion.answers[key] !== null
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClockIcon className="h-4 w-4" />
              <span>Time remaining: {formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md">
              <div className="space-y-4">
                {answerKeys.map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={key}
                      checked={
                        userAnswers[currentQuestionIndex]?.selectedAnswerKey === key
                      }
                      onChange={() => handleAnswerSelect(key)}
                      disabled={isSubmitted}
                      className="h-4 w-4 cursor-pointer"
                    />
                    <label className="text-sm">{currentQuestion.answers[key]}</label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || isSubmitted}
          >
            Previous
          </Button>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1 || isSubmitted}
            >
              Next
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitted || !userAnswers.every((a) => a.selectedAnswerKey !== null)}
              className="bg-teal-500 hover:bg-teal-600"
            >
              Submit Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizComponent;
