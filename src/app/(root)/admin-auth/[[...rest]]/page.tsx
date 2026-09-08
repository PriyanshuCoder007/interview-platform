"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignUp, SignIn } from "@clerk/nextjs";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import LoaderUI from "@/components/LoaderUI";
export default function AdminAuthPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const router = useRouter();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/admin-welcome"); 
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
   
      <SignedOut>
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMode("signup")}
            className={`px-4 py-2 rounded ${mode === "signup" ? "bg-blue-600 text-white" : "border"}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode("login")}
            className={`px-4 py-2 rounded ${mode === "login" ? "bg-blue-600 text-white" : "border"}`}
          >
            Log In
          </button>
        </div>

        <div className="w-full max-w-md">
          {mode === "signup" ? (
            <SignUp
                routing="path"
                path="/admin-auth"
                redirectUrl="/admin-welcome"
                appearance={{ elements: { card: "shadow-lg" } }}
                afterSignUpUrl="/admin-welcome"
                unsafeMetadata={{ role: "interviewer" }} 
              />
          ) : (
            <SignIn
              routing="path"
                path="/admin-auth"
                redirectUrl="/admin-welcome"
                appearance={{ elements: { card: "shadow-lg" } }}
                afterSignUpUrl="/admin-welcome"
                unsafeMetadata={{role: "interviewer"}}       
            />
          )}
        </div>
      </SignedOut>
          <SignedIn>
              <LoaderUI/>
          </SignedIn>
    </div>
  );
}