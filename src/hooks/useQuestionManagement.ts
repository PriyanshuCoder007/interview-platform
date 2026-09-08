import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import toast from "react-hot-toast";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface StarterCode {
  javascript: string;
  python: string;
  java: string;
}

type Difficulty = "easy" | "medium" | "hard";

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  examples: Example[];
  starterCode: StarterCode;
  constraints?: string[];
  createdAt?: number;
  createdBy?: string;
}

interface FormData {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  examples: Example[];
  starterCode: StarterCode;
  constraints: string[];
}

const TAGS = ["Array", "String", "Hash Table", "Dynamic Programming", "Math"];
const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const useQuestionManagement = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CodingQuestion | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const questions = useQuery(api.codingQuestions.getQuestions) || [];
  const createQuestion = useMutation(api.codingQuestions.createQuestion);
  const updateQuestion = useMutation(api.codingQuestions.updateQuestion);
  const deleteQuestion = useMutation(api.codingQuestions.deleteQuestion);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    difficulty: "medium",
    tags: [],
    examples: [{ input: "", output: "", explanation: "" }],
    starterCode: {
      javascript: "function solution() {\n  // Write your code here\n}",
      python: "def solution():\n    # Write your code here",
      java: "class Solution {\n    public void solution() {\n        // Write your code here\n    }\n}",
    },
    constraints: [""],
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      difficulty: "medium",
      tags: [],
      examples: [{ input: "", output: "", explanation: "" }],
      starterCode: {
        javascript: "function solution() {\n  // Write your code here\n}",
        python: "def solution():\n    # Write your code here",
        java: "class Solution {\n    public void solution() {\n        // Write your code here\n    }\n}",
      },
      constraints: [""],
    });
    setSelectedTags([]);
    setEditingQuestion(null);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Title and description are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        tags: selectedTags,
        constraints: formData.constraints.filter(c => c.trim() !== ""),
      };

      if (editingQuestion) {
        await updateQuestion({
          id: editingQuestion.id,
          ...payload,
        });
        toast.success("Question updated successfully!");
      } else {
        await createQuestion(payload);
        toast.success("Question created successfully!");
      }

      setOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (question: CodingQuestion) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      tags: question.tags,
      examples: question.examples,
      starterCode: question.starterCode,
      constraints: question.constraints || [""],
    });
    setSelectedTags(question.tags);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion({ id });
        toast.success("Question deleted successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete question");
      }
    }
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: "", output: "", explanation: "" }]
    }));
  };

  const removeExample = (index: number) => {
    if (formData.examples.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const updateExample = (index: number, field: keyof Example, value: string) => {
    setFormData(prev => {
      const newExamples = [...prev.examples];
      newExamples[index] = { ...newExamples[index], [field]: value };
      return { ...prev, examples: newExamples };
    });
  };

  const addConstraint = () => {
    setFormData(prev => ({
      ...prev,
      constraints: [...(prev.constraints || []), ""]
    }));
  };

  const removeConstraint = (index: number) => {
    if (!formData.constraints || formData.constraints.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints?.filter((_, i) => i !== index)
    }));
  };

  const updateConstraint = (index: number, value: string) => {
    setFormData(prev => {
      const newConstraints = [...(prev.constraints || [])];
      newConstraints[index] = value;
      return { ...prev, constraints: newConstraints };
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleDifficultyChange = (value: Difficulty) => {
    setFormData(prev => ({
      ...prev,
      difficulty: value
    }));
  };

  return {
    open,
    setOpen,
    isSubmitting,
    questions,
    formData,
    selectedTags,
    editingQuestion,
    TAGS,
    DIFFICULTIES,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    addExample,
    removeExample,
    updateExample,
    addConstraint,
    removeConstraint,
    updateConstraint,
    toggleTag,
    handleDifficultyChange,
  };
};