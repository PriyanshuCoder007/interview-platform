import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { Loader2Icon, XIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TIME_SLOTS } from "@/constants";
import UserInfo from "@/components/UserInfo";
import MeetingCard from "@/components/MeetingCard";
import { useInterviewScheduling } from "@/hooks/useInterviewScheduling";
import toast from "react-hot-toast";

function InterviewScheduleUI() {
  const {
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
    user,
    selectedInterviewers,
    availableInterviewers,
    
    // Functions
    scheduleMeeting,
    resetForm,
    addInterviewer,
    removeInterviewer,
    toggleQuestion,
    getQuestionsByDifficulty,
  } = useInterviewScheduling();

  const DIFFICULTIES = ["easy", "medium", "hard"] as const;
  type Difficulty = typeof DIFFICULTIES[number];

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await scheduleMeeting();
      if (success) {
        setOpen(true);
        resetForm();
        toast.success("Interview scheduled successfully!");
      }
    } catch (error) {
      console.error("Failed to schedule interview:", error);
      toast.error("Failed to schedule interview.");
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interviews</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage interviews</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">Schedule Interview</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px] h-[calc(100vh-200px)] overflow-auto">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleScheduleInterview}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interview Name</label>
                  <Input
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Interview Description</label>
                  <Textarea
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quiz Category</label>
                  <Select
                    value={formData.quizCategory}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, quizCategory: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quiz Difficulty</label>
                  <Select
                    value={formData.quizDifficulty}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, quizDifficulty: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizDifficulties.map((diff) => (
                        <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Difficulty</label>
                  <Select
                    value={selectedDifficulty}
                    onValueChange={(value: Difficulty) =>
                      setSelectedDifficulty(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium capitalize">
                    {selectedDifficulty} Questions
                  </label>
                  <div className="space-y-2">
                    {getQuestionsByDifficulty(selectedDifficulty).map((question) => (
                      <div
                        key={question._id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedQuestions.some((q) => q._id === question._id)
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-accent"
                        }`}
                        onClick={() => toggleQuestion(question)}
                      >
                        <div className="font-medium">{question.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {question.difficulty} • {question.tags.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedQuestions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selected Questions</label>
                    <div className="space-y-2">
                      {selectedQuestions.map((question) => (
                        <div
                          key={question._id}
                          className="p-3 bg-primary/5 border border-primary/30 rounded-md flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{question.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {question.difficulty}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleQuestion(question);
                            }}
                            className="text-destructive hover:bg-destructive/10 p-1 rounded"
                            type="button"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Candidate</label>
                  <Select
                    value={formData.candidateId}
                    onValueChange={(candidateId) =>
                      setFormData({ ...formData, candidateId })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((candidate) => (
                        <SelectItem key={candidate.clerkId} value={candidate.clerkId}>
                          <UserInfo user={candidate} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Interviewers</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedInterviewers.map((interviewer) => (
                      <div
                        key={interviewer.clerkId}
                        className="inline-flex items-center gap-2 bg-secondary px-2 py-1 rounded-md text-sm"
                      >
                        <UserInfo user={interviewer} />
                        {interviewer.clerkId !== user?.id && (
                          <button
                            onClick={() => removeInterviewer(interviewer.clerkId)}
                            className="hover:text-destructive transition-colors"
                            type="button"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {availableInterviewers.length > 0 && (
                    <Select onValueChange={addInterviewer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add interviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInterviewers.map((interviewer) => (
                          <SelectItem
                            key={interviewer.clerkId}
                            value={interviewer.clerkId}
                          >
                            <UserInfo user={interviewer} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({ ...formData, date })}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Select
                      value={formData.time}
                      onValueChange={(time) =>
                        setFormData({ ...formData, time })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem
                            key={time}
                            value={time}
                            className={
                              formData.time === time ? "bg-primary/10 font-semibold" : ""
                            }
                          >
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => { setOpen(false); resetForm(); }} 
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Interview"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!interviews ? (
        <div className="flex justify-center py-12">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : interviews.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <MeetingCard key={interview._id} interview={interview} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No interviews scheduled
        </div>
      )}
    </div>
  );
}

export default InterviewScheduleUI;