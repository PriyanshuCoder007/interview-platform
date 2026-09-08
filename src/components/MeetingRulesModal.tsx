import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface MeetingRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
}

function MeetingRulesModal({ isOpen, onClose, onJoin }: MeetingRulesModalProps) {
  const [hasReadAll, setHasReadAll] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[37vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Meeting Rules & Guidelines
          </DialogTitle>
        </DialogHeader>

        <div
          className="space-y-6 py-4 max-h-[55vh] overflow-y-auto"
          style={{
            scrollBehavior: "smooth",
            transition: "all 0.3s ease",
            scrollbarWidth: "thin", 
            scrollbarColor: "#22C55EE6 #f1f1f133", 
          }}
        >
          <div className="space-y-4">
            {[
              {
                title: "1. Resume Submission Required",
                description:
                  "You must upload your resume before joining the interview. Candidates without an uploaded resume will not be able to proceed.",
              },
              {
                title: "2. Tab Switching Restriction",
                description:
                  "Avoid switching tabs or minimizing the browser during the interview, as it may trigger automatic session termination.",
              },
              {
                title: "3. Screen Sharing",
                description:
                  "Screen sharing is monitored. Only share content relevant to the interview.",
              },
              {
                title: "4. Video and Microphone Must Remain On",
                description:
                  "Keep your camera and microphone enabled throughout the entire interview. Disabling either may flag your session for review.",
              },
              {
                title: "5. Stable Connection Required",
                description:
                  "A consistent internet connection is mandatory. Frequent disruptions may lead to interview cancellation.",
              },
            ].map((rule, index) => (
              <div
                key={index}
                className="space-y-2 p-3 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-900"
                style={{ cursor: "default" }}
                role="region"
                aria-label={`Rule ${index + 1}`}
              >
                <h3 className="font-semibold text-lg">{rule.title}</h3>
                <p className="text-[0.8vw] text-muted-foreground">{rule.description}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="readAll"
              checked={hasReadAll}
              onChange={(e) => setHasReadAll(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <label
              htmlFor="readAll"
              className="text-sm"
            >
              I have read and agree to all the rules and conditions
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4 mr-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={!hasReadAll}
              className="border-primary"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                onClose();
                onJoin();
              }}
              disabled={!hasReadAll}
            >
              Accept &amp; Join Meeting
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MeetingRulesModal;