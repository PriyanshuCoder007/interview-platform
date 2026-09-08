import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    image: v.optional(v.string()),
    role: v.union(v.literal("candidate"), v.literal("interviewer")), 
  },
  handler: async (ctx, args) => {
    // 1. Check if user exists (using index)
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    // 2. If exists, update (optional)
    if (existingUser) {
      return await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        role: args.role,
        image: args.image,
      });
    }

    // 3. If new, insert
    return await ctx.db.insert("users", args);
  },
});

export const getUsers = query({
  handler: async (ctx) => {
  try {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
  console.warn("Unauthorized access attempt to getUsers");
  return [];
  }
  
    return await ctx.db.query("users").collect();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
  },
  });

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

export const updateResumeUrl = mutation({
  args: {
    clerkId: v.string(),
    resumeUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!existingUser) {
      throw new Error("User not found");
    }

    await ctx.db.patch(existingUser._id, {
      resumeUrl: args.resumeUrl,
    });
  },
});