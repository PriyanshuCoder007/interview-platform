"use client";

import {
  CallControls,
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import {
  LayoutListIcon,
  LoaderIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import EndCallButton from "./EndCallButton";
import CodeEditor from "./CodeEditor";
import QuizComponent from "./QuizComponent";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import toast from "react-hot-toast";
import TabSwitchWarning from "./TabSwitchWarning";
import { Doc } from "../../convex/_generated/dataModel";

function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const { useCallCallingState, useLocalParticipant } = useCallStateHooks();
  const callingState = useCallCallingState();
  const call = useCall();
  const localParticipant = useLocalParticipant();

  const updateInterviewStatus = useMutation(api.interviews.updateInterviewStatus);
  const interview = useQuery(api.interviews.getInterviewByStreamCallId, {
    streamCallId: call?.id || "",
  });

  // Determine if current user is the candidate
  const isCandidate = localParticipant?.userId === interview?.candidateId;

  // Handle quiz completion
  const handleQuizComplete = () => {
    setIsQuizComplete(true);
  };

  // Handle ending the meeting for both participants
  const handleForceEndMeeting = async () => {
    try {
      if (call) {
        await call.endCall();
      }

      if (interview?._id) {
        await updateInterviewStatus({
          id: interview._id,
          status: "completed",
        });
      }

      toast.success("Meeting ended");
      router.push("/");
    } catch (error) {
      console.error("Failed to end meeting:", error);
      toast.error("Failed to end meeting");
    }
  };

  // Handle when candidate exceeds tab switches
  const handleExceededTabSwitches = async () => {
    setShowTabWarning(true);
    await handleForceEndMeeting();
  };

  // Listen for call ending events (for interviewer)
  useEffect(() => {
    if (!call || isCandidate) return;

    const handleCallEnded = () => {
      toast.error("Meeting ended because candidate left");
      router.push("/");
    };

    call.on("call.ended", handleCallEnded);
    return () => call.off("call.ended", handleCallEnded);
  }, [call, isCandidate, router]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoaderIcon className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem-1px)]">
      {isCandidate ? (
        // Candidate view with QuizComponent or CodeEditor
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={35}
            minSize={25}
            maxSize={100}
            className="relative"
          >
            <div className="absolute inset-0">
              {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout />}

              {showParticipants && (
                <div className="absolute right-0 top-0 h-full w-[300px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <CallParticipantsList
                    onClose={() => setShowParticipants(false)}
                  />
                </div>
              )}
            </div>

            <div className="absolute bottom-4 left-0 right-0">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center px-4">
                  <CallControls onLeave={() => router.push("/")} />

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-10"
                        >
                          <LayoutListIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setLayout("grid")}>
                          Grid View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLayout("speaker")}>
                          Speaker View
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="outline"
                      size="icon"
                      className="size-10"
                      onClick={() => setShowParticipants(!showParticipants)}
                    >
                      <UsersIcon className="size-4" />
                    </Button>

                    <EndCallButton />
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65} minSize={25}>
          {interview?._id ? (
              isQuizComplete ? (
                <CodeEditor interviewId={interview._id} />
              ) : (
                <QuizComponent
                  interviewId={interview._id}
                  onQuizComplete={handleQuizComplete}
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <LoaderIcon className="size-6 animate-spin" />
              </div>
            )}

          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // Interviewer view (only video, no QuizComponent or CodeEditor)
        <div className="relative h-full">
          <div className="absolute inset-0">
            {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout />}

            {showParticipants && (
              <div className="absolute right-0 top-0 h-full w-[300px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CallParticipantsList
                  onClose={() => setShowParticipants(false)}
                />
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-0 right-0">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap justify-center px-4">
                <CallControls onLeave={() => router.push("/")} />

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-10"
                      >
                        <LayoutListIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setLayout("grid")}>
                        Grid View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLayout("speaker")}>
                        Speaker View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10"
                    onClick={() => setShowParticipants(!showParticipants)}
                  >
                    <UsersIcon className="size-4" />
                  </Button>

                  <EndCallButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab switch warning for candidates only */}
      {isCandidate && (
        <TabSwitchWarning
          open={showTabWarning}
          onClose={() => setShowTabWarning(false)}
          interview={interview as Doc<"interviews">}
          onForceEndMeeting={handleForceEndMeeting}
          maxTabSwitches={2}
          isCandidate={isCandidate}
          onExceededTabSwitches={handleExceededTabSwitches}
        />
      )}
    </div>
  );
}

export default MeetingRoom;