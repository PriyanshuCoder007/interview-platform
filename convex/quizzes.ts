import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const submitQuiz = mutation({
  args: {
    interviewId: v.id("interviews"),
    answers: v.array(
      v.object({
        questionId: v.number(),
        questionTitle: v.string(),
        selectedAnswer: v.union(v.string(), v.null()),
        selectedAnswerKey: v.optional(v.union(v.string(), v.null())), 
        correctAnswer: v.optional(v.union(v.string(), v.null())),
        correctAnswerKey: v.optional(v.union(v.string(), v.null())),    
      })
    ),
  },
  handler: async (ctx, args) => {
    const quizId = await ctx.db.insert("quizzes", {
      interviewId: args.interviewId,
      answers: args.answers,
      submittedAt: Date.now(),
    });
    return quizId;
  },
});


export const getQuizByInterviewId = query({
  args: {
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.db
      .query("quizzes")
      .filter((q) => q.eq(q.field("interviewId"), args.interviewId))
      .first();
    return quiz;
  },
});


export const getAllQuizzes = query({
  handler: async (ctx) => {
    return await ctx.db.query("quizzes").collect();
  },
});