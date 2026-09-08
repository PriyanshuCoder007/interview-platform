import { Clock, Code2, Calendar, Users } from "lucide-react";

export const INTERVIEW_CATEGORY = [
  { id: "upcoming", title: "Upcoming Interviews", variant: "outline" },
  { id: "completed", title: "Completed", variant: "secondary" },
  { id: "succeeded", title: "Succeeded", variant: "default" },
  { id: "failed", title: "Failed", variant: "destructive" },
] as const;

export const TIME_SLOTS = [
  "09:00", "10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55",
  "11:00", "11:05", "11:10", "11:15", "11:20", "11:25", "11:30", "11:35", "11:40", "11:45", "11:50", "11:55",
  "12:00", "12:05", "12:10", "12:15", "12:20", "12:25", "12:30", "12:35", "12:40", "12:45", "12:50", "12:55",
  "13:00", "13:05", "13:10", "13:15", "13:20", "13:25", "13:30", "13:35", "13:40", "13:45", "13:50", "13:55",
  "14:00", "14:05", "14:10", "14:15", "14:20", "14:25", "14:30", "14:35", "14:40", "14:45", "14:50", "14:55",
  "15:00", "15:05", "15:10", "15:15", "15:20", "15:25", "15:30", "15:35", "15:40", "15:45", "15:50", "15:55",
  "16:00", "16:05", "16:10", "16:15", "16:20", "16:25", "16:30", "16:35", "16:40", "16:45", "16:50", "16:55",
  "17:00", "17:05", "17:10", "17:15", "17:20", "17:25", "17:30", "17:35", "17:40", "17:45", "17:50", "17:55",
  "18:00", "18:05", "18:10", "18:15", "18:20", "18:25", "18:30", "18:35", "18:40", "18:45", "18:50", "18:55",
  "19:00"
];

export const QUICK_ACTIONS = [
  {
    icon: Code2,
    title: "Questions",
    description: "Create a new coding question",
    color: "primary",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  },
  {
    icon: Users,
    title: "Join Interview",
    description: "Enter via invitation link",
    color: "purple-500",
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
  },
  {
    icon: Calendar,
    title: "Schedule",
    description: "Plan upcoming interviews",
    color: "blue-500",
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
  },
  {
    icon: Clock,
    title: "Recordings",
    description: "Access past interviews",
    color: "orange-500",
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
  },
];
  
export const LANGUAGES = [
  { id: "javascript", name: "JavaScript", icon: "/javascript.png" },
  { id: "python", name: "Python", icon: "/python.png" },
  { id: "java", name: "Java", icon: "/java.png" },
] as const;

export interface CodeQuestion {
  id: string;
  title: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  constraints?: string[];
}

export type QuickActionType = (typeof QUICK_ACTIONS)[number];