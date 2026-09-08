"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import toast from "react-hot-toast";
import LoaderUI from "@/components/LoaderUI";
import { getCandidateInfo, groupInterviews } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { INTERVIEW_CATEGORY } from "@/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";
import { format } from "date-fns";
import CommentDialog from "@/components/CommentDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Interview = Doc<"interviews">;

interface QuizAnswer {
  questionId: number;
  questionTitle: string;
  selectedAnswer: string | null;
  selectedAnswerKey?: string | null; 
  correctAnswer?: string | null;
  correctAnswerKey?: string | null;
}


interface CodeAnswer {
  title: string;
  [language: string]: string; 
}

function DashboardPage() {
  const users = useQuery(api.users.getUsers);
  const interviews = useQuery(api.interviews.getAllInterviews);
  const updateStatus = useMutation(api.interviews.updateInterviewStatus);

  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [visibleQuestions, setVisibleQuestions] = useState(10);
  const [activeTab, setActiveTab] = useState<"quiz" | "code">("quiz");

  // Memoize grouped interviews to prevent unnecessary recalculations
  const groupedInterviews = useMemo(() => {
    return interviews ? groupInterviews(interviews) as Record<string, Interview[]> : {};
  }, [interviews]);

  // Fetch quiz data only when needed
  const quiz = useQuery(
    api.quizzes.getQuizByInterviewId,
    selectedInterview?._id ? { interviewId: selectedInterview._id } : "skip"
  );

 const rawAnswers = useQuery(
  api.interviews.getInterviewAnswers,
  selectedInterview?._id ? { interviewId: selectedInterview._id } : "skip"
);

// Transform rawAnswers to make sure it includes `title` for each
const codeAnswers: Record<string, CodeAnswer> | null = useMemo(() => {
  if (!rawAnswers) return null;

  const result: Record<string, CodeAnswer> = {};

  for (const [questionId, answerObj] of Object.entries(rawAnswers)) {
    if (!answerObj.title || typeof answerObj.title !== "string") continue;

    result[questionId] = {
      ...answerObj,
      title: answerObj.title,
    };
  }

  return result;
}, [rawAnswers]);

  // Calculate quiz stats
  const { correctAnswers, totalQuestions } = useMemo(() => {
    let correct = 0;
    let total = 0;
    
    if (quiz?.answers) {
      total = quiz.answers.length;
      correct = quiz.answers.reduce((count, answer: QuizAnswer) => {
        return (answer.selectedAnswerKey  !== null && 
                answer.correctAnswerKey !== null && 
                answer.selectedAnswerKey  === answer.correctAnswerKey) ? count + 1 : count;
      }, 0);
    }
    
    return { correctAnswers: correct, totalQuestions: total };
  }, [quiz]);

  const handleStatusUpdate = async (interviewId: Id<"interviews">, status: string) => {
    try {
      await updateStatus({ id: interviewId, status });
      toast.success(`Interview marked as ${status}`);
    } catch (error) {
      toast.error("Failed to update status: " + error);
    }
  };

  const handleLoadMore = () => {
    setVisibleQuestions(prev => Math.min(prev + 5, quiz?.answers?.length || prev + 5));
  };

  if (!interviews || !users) return <LoaderUI />;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-8">
        <Link href="/schedule">
          <Button>Schedule New Interview</Button>
        </Link>
      </div>

      <div className="space-y-8">
        {INTERVIEW_CATEGORY.map((category) => (
          groupedInterviews[category.id]?.length > 0 && (
            <section key={category.id}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">{category.title}</h2>
                <Badge variant={category.variant}>
                  {groupedInterviews[category.id].length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedInterviews[category.id].map((interview) => {
                  const candidateInfo = getCandidateInfo(users, interview.candidateId);
                  const startTime = new Date(interview.startTime);

                  return (
                    <Card
                      key={interview._id}
                      className="hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedInterview(interview)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={candidateInfo.image} />
                            <AvatarFallback>{candidateInfo.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">
                              {candidateInfo.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {interview.title}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(startTime, "MMM dd")}
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {format(startTime, "hh:mm a")}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                        {interview.status === "completed" && (
                          <div className="flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                            <Button
                              className="flex-1"
                              onClick={() => handleStatusUpdate(interview._id, "succeeded")}
                            >
                              <CheckCircle2Icon className="h-4 w-4 mr-2" />
                              Pass
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleStatusUpdate(interview._id, "failed")}
                            >
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Fail
                            </Button>
                          </div>
                        )}
                        <div className="flex gap-2 w-fit justify-start items-start" onClick={(e) => e.stopPropagation()}>
                          <CommentDialog  interviewId={interview._id} />
                          {candidateInfo.resumeUrl ? (
                            <Button
                              variant="outline"
                              onClick={() => window.open(candidateInfo.resumeUrl, "_blank")}
                              className="border-primary"
                            >
                              View Resume
                            </Button>
                          ) : (
                                <p className="text-[.75vw] text-muted-foreground">
                                  {users.find((u) => u._id === interview.candidateId || u._id.toString() === interview.candidateId)
                                    ? "Candidate information not found."
                                    : "Candidate has not uploaded a resume."}
                                </p>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </section>
          )
        ))}
      </div>

      <Dialog
        open={!!selectedInterview}
        onOpenChange={(isOpen) => !isOpen && setSelectedInterview(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
          </DialogHeader>

          <div className="mb-4">
            <div className="flex gap-2">
              <Button
                variant={activeTab === "quiz" ? "default" : "outline"}
                onClick={() => setActiveTab("quiz")}
                className="flex-1"
              >
                Quiz Results
              </Button>
              <Button
                variant={activeTab === "code" ? "default" : "outline"}
                onClick={() => setActiveTab("code")}
                className="flex-1"
              >
                Code Review
              </Button>
            </div>
          </div>

          {activeTab === "quiz" ? (
            quiz === undefined ? (
              <LoaderUI />
            ) : quiz === null ? (
              <p className="text-sm text-muted-foreground">No quiz answers available.</p>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium text-lg mb-3 text-center md:text-left">
                    Quiz Results: {correctAnswers}/{totalQuestions} Correct
                  </h3>
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                    {quiz.answers.slice(0, visibleQuestions).map((answer: QuizAnswer, index: number) => (
                      <AnswerCard key={index} answer={answer} index={index} />
                    ))}
                  </div>
                  {visibleQuestions < quiz.answers.length && (
                    <div className="mt-4 text-center">
                      <Button onClick={handleLoadMore} className="w-full md:w-auto">
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            codeAnswers === undefined ? (
              <LoaderUI />
            ) : codeAnswers === null ? (
              <p className="text-sm text-muted-foreground">No code answers available.</p>
            ) : (
              <CodeAnswersView answers={codeAnswers ?? {}} />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Extracted component for answer cards
const AnswerCard = ({ answer, index }: { answer: QuizAnswer; index: number }) => {
  const isCorrect = answer.selectedAnswerKey === answer.correctAnswerKey;  
  return (
    <div className={`p-3 rounded-md border ${
      isCorrect 
        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
        : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
    }`}>
      <p className="text-sm md:text-base font-medium mb-2">
        {answer.questionTitle || `Question ${index + 1}`}
      </p>
      <div className="flex flex-col md:flex-row md:gap-4">
        <p className="text-sm mb-1 md:mb-0">
          <span className="font-medium">Your Answer:</span>{" "}
          <span className={isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
            {answer.selectedAnswer ?? "Not answered"}
          </span>
        </p>
        {answer.correctAnswer !== undefined && (
          <p className="text-sm">
            <span className="font-medium">Correct Answer:</span>{" "}
            <span className="text-green-600 dark:text-green-400">
              {answer.correctAnswer ?? "Not available"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

const CodeAnswersView = ({ answers }: { answers: Record<string, CodeAnswer> }) => {
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      {Object.entries(answers).map(([questionId, questionData]) => {
        const { title, ...codeSnippets } = questionData;
        console.log(title)
        return (
          <div key={questionId} className="border rounded-lg p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {Object.entries(codeSnippets).map(([lang, code]) => (
                <div key={lang} className="p-3 rounded-md bg-gray-100 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded">
                      {lang}
                    </span>
                  </div>
                  <pre className="text-sm p-3 rounded bg-white dark:bg-black text-gray-900 dark:text-gray-100 whitespace-pre-wrap overflow-x-auto">
                    {code}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardPage;