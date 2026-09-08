import { useUser } from "@clerk/nextjs"; // or "@clerk/clerk-react" if using React
import useMeetingActions from "@/hooks/useMeetingActions";
import { Doc } from "../../convex/_generated/dataModel";
import { getMeetingStatus } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CalendarIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import MeetingRulesModal from "./MeetingRulesModal";

type Interview = Doc<"interviews">;

function MeetingCard({ interview }: { interview: Interview }) {
  const { joinMeeting } = useMeetingActions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, setNow] = useState(new Date());
  const { user } = useUser();

  useEffect(() => {
    const startTime = new Date(interview.startTime).getTime();
    const delay = startTime - Date.now();

    if (delay > 0) {
      const timer = setTimeout(() => {
        setNow(new Date());
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [interview.startTime]);

  const status = getMeetingStatus(interview);
  const formattedDate = format(new Date(interview.startTime), "EEEE, MMMM d · h:mm a");

  const users = useQuery(api.users.getUsers) ?? [];
  const currentUser = users.find(u => u.clerkId === user?.id);
  const isCandidate = currentUser?.role === "candidate";
  
  const candidates = users?.filter((u) => u.role === "candidate");
  const candidate = candidates.find(({ clerkId }) => clerkId === interview.candidateId);

  const handleJoinClick = () => {
    if (isCandidate) {
      setIsDialogOpen(true);
    } else {
      handleJoinMeeting();
    }
  };

  const handleJoinMeeting = () => {
    joinMeeting(interview.streamCallId);
  };

  return (
    <>
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              {formattedDate}
            </div>

            <Badge
              variant={
                status === "live" ? "default" : status === "upcoming" ? "secondary" : "outline"
              }
            >
              {status === "live" ? "Live Now" : status === "upcoming" ? "Upcoming" : "Completed"}
            </Badge>
          </div>

          {candidate && (
            <p className="text-lg font-semibold text-primary">
              Candidate: {candidate.name}
            </p>
          )}

          <CardTitle>{interview.title}</CardTitle>

          {interview.description && (
            <CardDescription className="line-clamp-2">
              {interview.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {status === "live" && (
            <Button className="w-full" onClick={handleJoinClick}>
              Join Meeting
            </Button>
          )}

          {status === "upcoming" && (
            <Button variant="outline" className="w-full" disabled>
              Waiting to Start
            </Button>
          )}
        </CardContent>
      </Card>

      {isCandidate && (
        <MeetingRulesModal
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onJoin={handleJoinMeeting}
        />
      )}
    </>
  );
}

export default MeetingCard;