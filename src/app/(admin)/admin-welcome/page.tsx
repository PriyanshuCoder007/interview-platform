import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

export default async function AdminWelcomePage() {
  const user = await currentUser();
  if (!user) return redirect("/");

  await fetchMutation(api.users.syncUser, {
    name: user.fullName ?? "Unnamed Admin",
    email: user.emailAddresses[0]?.emailAddress ?? "",
    clerkId: user.id,
    image: user.imageUrl,
    role:"interviewer"
  });

  redirect("/");
}
