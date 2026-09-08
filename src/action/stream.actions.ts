"use server";

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

export const streamTokenProvider = async (): Promise<string> => {

  const user = await currentUser();
  if (!user) {
    console.error("streamTokenProvider: User not authenticated");
    throw new Error("User not authenticated");
  }
  
  if (!process.env.NEXT_PUBLIC_STREAM_API_KEY || !process.env.STREAM_SECRET_KEY) {
    console.error("streamTokenProvider: Stream API keys are missing", {
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY || "Unset",
      secretKey: process.env.STREAM_SECRET_KEY ? "Set" : "Unset",
    });
    throw new Error("Stream API keys are missing");
  }

  try {
    const streamClient = new StreamClient(
      process.env.NEXT_PUBLIC_STREAM_API_KEY,
      process.env.STREAM_SECRET_KEY
    );
    

    const issuedAt = Math.floor(Date.now() / 1000) - 60;
    const token = streamClient.generateUserToken({
      user_id: user.id,
      iat: issuedAt,
    });
    
    return token;
  } catch (error) {
    console.error("streamTokenProvider: Error generating Stream token:", error);
    throw new Error(`Failed to generate Stream token`);
  }
};