import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  console.log("Clerk Middleware: Processing route:", req.url);
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|favicon.ico).*)",
    "/",
    "/api/(.*)",
    "/meeting/(.*)",
    "/schedule",
  ],
};