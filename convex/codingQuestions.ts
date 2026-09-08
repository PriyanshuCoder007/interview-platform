// convex/codingQuestions.ts
import { mutation,query } from "./_generated/server";
import { v } from "convex/values";

export const createQuestion = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    tags: v.array(v.string()),
    examples: v.array(v.object({
      input: v.string(),
      output: v.string(),
      explanation: v.optional(v.string()),
    })),
    starterCode: v.object({
      javascript: v.string(),
      python: v.string(),
      java: v.string(),
    }),
    constraints: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    return await ctx.db.insert("codingQuestions", {
      ...args,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      createdBy: identity.subject,
    });
  },
});

export const updateQuestion = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    difficulty: v.optional(
      v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
      )
    ),
    tags: v.optional(v.array(v.string())),
    examples: v.optional(v.array(v.object({
      input: v.string(),
      output: v.string(),
      explanation: v.optional(v.string()),
    }))),
    starterCode: v.optional(v.object({
      javascript: v.string(),
      python: v.string(),
      java: v.string(),
    })),
    constraints: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const { id, ...rest } = args;
    const question = await ctx.db
      .query("codingQuestions")
      .withIndex("by_question_id", (q) => q.eq("id", id))
      .unique();
    
    if (!question) {
      throw new Error("Question not found");
    }
    
    if (question.createdBy !== identity.subject) {
      throw new Error("Unauthorized - You can only edit your own questions");
    }
    
    return await ctx.db.patch(question._id, rest);
  },
});

export const deleteQuestion = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const question = await ctx.db
      .query("codingQuestions")
      .withIndex("by_question_id", (q) => q.eq("id", args.id))
      .unique();
    
    if (!question) {
      throw new Error("Question not found");
    }
    
    if (question.createdBy !== identity.subject) {
      throw new Error("Unauthorized - You can only delete your own questions");
    }
    
    await ctx.db.delete(question._id);
    return true;
  },
});

export const getQuestions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("codingQuestions").collect();
  },
});
