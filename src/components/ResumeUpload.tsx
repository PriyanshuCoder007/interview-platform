"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function ResumeUpload() {
  const { user } = useUser();
  const updateResume = useMutation(api.users.updateResumeUrl);
  const userData = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const [resumeUrl, setResumeUrl] = useState(userData?.resumeUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async () => {
    if (!user || !resumeUrl) return;
    
    try {
      setIsSubmitting(true);
      await updateResume({
        clerkId: user.id,
        resumeUrl: resumeUrl,
      });
      setIsDialogOpen(false); 
    } catch (error) {
      console.error("Error updating resume URL:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userData?.resumeUrl) {
    return (
      <Button 
        className="bg-primary "
        onClick={() => window.open(userData.resumeUrl, "_blank")}
      >
        View Resume
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary">Upload Resume</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your resume link</DialogTitle>
          <DialogDescription>
            Paste your Google Drive or other cloud storage link here.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Resume Link
            </Label>
            <Input
              id="link"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit}
            disabled={!resumeUrl || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}