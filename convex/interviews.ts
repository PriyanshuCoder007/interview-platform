import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const interviews = await ctx.db.query("interviews").collect();

    return interviews;
  },
});

export const getMyInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_candidate_id", (q) => q.eq("candidateId", identity.subject))
      .collect();

    return interviews!;
  },
});

export const getInterviewById = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .filter(q => q.eq(q.field("_id"), args.interviewId)) // Fix query here
      .first();
  },
});

export const getInterviewByStreamCallId = query({
  args: { streamCallId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
      .first();
  },
});

export const createInterview = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
    quizCategory: v.optional(v.string()),
    quizDifficulty: v.optional(v.string()),
    codingQuestions: v.optional(
      v.array(
        v.object({
          id: v.optional(v.id("codingQuestions")), // Make id optional
          title: v.string(),
          difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
        })
      )
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("interviews", {
      ...args,
    });
  },
});

export const updateInterviewStatus = mutation({
  args: {
    id: v.id("interviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "completed" ? { endTime: Date.now() } : {}),
    });
  },
});

export const saveInterviewAnswers = mutation({
  args: {
    interviewId: v.id("interviews"),
    answers: v.any(), // This will accept the structured coding answers
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // First delete any existing answers for this interview
    const existingAnswers = await ctx.db
      .query("interviewAnswers")
      .withIndex("by_interview_id", q => q.eq("interviewId", args.interviewId))
      .collect();

    await Promise.all(existingAnswers.map(answer => ctx.db.delete(answer._id)));

    // Then save all new answers
    const saveOperations = [];
    const timestamp = Date.now();

    for (const questionId in args.answers) {
      for (const language in args.answers[questionId]) {
        saveOperations.push(
          ctx.db.insert("interviewAnswers", {
            interviewId: args.interviewId,
            questionId,
            language,
            code: args.answers[questionId][language],
            createdAt: timestamp,
          })
        );
      }
    }

    await Promise.all(saveOperations);
  },
});

export const getInterviewAnswers = query({
  args: {
    interviewId: v.optional(v.union(v.id("interviews"), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    if (!args.interviewId) return {};

    // Get all answers for this interview
    const answers = await ctx.db
      .query("interviewAnswers")
      .withIndex("by_interview_id", q => q.eq("interviewId", args.interviewId!))
      .collect();

    // Get the interview document to access its questions
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) return {};

    // Get coding questions for this interview
    const codingQuestions = interview.codingQuestions || [];

    // Create a map of question IDs to their titles
    const questionMap = new Map(
      codingQuestions.map(q => [
        q.id?.toString(), // Convert Id to string for comparison
        q.title
      ])
    );
    
    const result: Record<string, Record<string, string>> = {};
    
    answers.forEach(answer => {
      const questionIdStr = answer.questionId.toString();
      
      if (!result[questionIdStr]) {
        // Try to find matching question by ID first
        let title = questionMap.get(questionIdStr);
        
        // If not found by ID, try alternative matching strategies:
        if (!title) {          
          title = "Untitled Question";
        } 
        result[questionIdStr] = { title };
      }
      
      result[questionIdStr][answer.language] = answer.code;
    });

    return result;
  },
});

export const getInterviewAnswersByQuestion = query({
  args: {
    interviewId: v.id("interviews"),
    questionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const answers = await ctx.db
      .query("interviewAnswers")
      .withIndex("by_interview_id", q => q.eq("interviewId", args.interviewId))
      .filter(q => q.eq(q.field("questionId"), args.questionId))
      .collect();

    return answers;
  },
});