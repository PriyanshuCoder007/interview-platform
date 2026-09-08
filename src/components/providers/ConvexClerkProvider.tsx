"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!convexUrl || !clerkPublishableKey) {
  throw new Error("Missing required environment variables: NEXT_PUBLIC_CONVEX_URL or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

const convex = new ConvexReactClient(convexUrl);

function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;
