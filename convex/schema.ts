import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
    clerkId: v.string(),
    resumeUrl: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  interviews: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
    quizCategory: v.optional(v.string()),
    quizDifficulty: v.optional(v.string()),
    codingQuestions: v.optional(
      v.array(
        v.object({
          id: v.optional(v.id("codingQuestions")), 
          title: v.string(),
          difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
        })
      )
    ),
  })
  .index("by_candidate_id", ["candidateId"])
  .index("by_stream_call_id", ["streamCallId"]),

  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviewerId: v.string(),
    interviewId: v.id("interviews"),
  }).index("by_interview_id", ["interviewId"]),

  // interview answers
  interviewAnswers: defineTable({
    interviewId: v.id("interviews"),
    questionId: v.string(),
    language: v.string(),
    code: v.string(),
    createdAt: v.number(),
  })
  .index("by_interview_id", ["interviewId"])
  .index("by_interview_question", ["interviewId", "questionId"]),

  // coding Question schema
  codingQuestions: defineTable({
    id: v.string(),
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
    createdAt: v.number(),
    createdBy: v.string(), 
  })
  .index("by_question_id", ["id"])
  .index("by_difficulty", ["difficulty"])
  .index("by_created_by", ["createdBy"]),

 quizzes: defineTable({
    interviewId: v.id("interviews"),
    submittedAt: v.float64(), 
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
  }).index("by_interviewId", ["interviewId"]),
});

