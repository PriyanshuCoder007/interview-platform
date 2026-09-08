import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { Loader2Icon, XIcon, PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useQuestionManagement } from "../../../hooks/useQuestionManagement";

export function QuestionManagementUI() {
  const {
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
  } = useQuestionManagement();

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coding Questions</h1>
          <p className="text-muted-foreground mt-1">Manage your coding interview questions</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" onClick={() => resetForm()}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? "Edit Question" : "Create New Question"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* TITLE */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Two Sum"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              {/* DIFFICULTY */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select
                  value={formData.difficulty}
                  onValueChange={handleDifficultyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TAGS */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe the problem in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>

              {/* EXAMPLES */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Examples</label>
                {formData.examples.map((example, index) => (
                  <div key={index} className="space-y-2 border p-4 rounded-lg relative">
                    {formData.examples.length > 1 && (
                      <button
                        onClick={() => removeExample(index)}
                        className="absolute top-2 right-2 text-destructive hover:text-destructive/80"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Input</label>
                        <Input
                          placeholder="nums = [2,7,11,15], target = 9"
                          value={example.input}
                          onChange={(e) => updateExample(index, "input", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Output</label>
                        <Input
                          placeholder="[0,1]"
                          value={example.output}
                          onChange={(e) => updateExample(index, "output", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Explanation (optional)</label>
                      <Input
                        placeholder="Because nums[0] + nums[1] == 9..."
                        value={example.explanation || ""}
                        onChange={(e) => updateExample(index, "explanation", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExample}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Example
                </Button>
              </div>

              {/* CONSTRAINTS */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Constraints</label>
                {formData.constraints.map((constraint, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="2 ≤ nums.length ≤ 104"
                      value={constraint}
                      onChange={(e) => updateConstraint(index, e.target.value)}
                    />
                    {formData.constraints.length > 1 && (
                      <button
                        onClick={() => removeConstraint(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConstraint}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Constraint
                </Button>
              </div>

              {/* STARTER CODE */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Starter Code</h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium">JavaScript</label>
                  <Textarea
                    value={formData.starterCode.javascript}
                    onChange={(e) => setFormData({
                      ...formData,
                      starterCode: {
                        ...formData.starterCode,
                        javascript: e.target.value
                      }
                    })}
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium">Python</label>
                  <Textarea
                    value={formData.starterCode.python}
                    onChange={(e) => setFormData({
                      ...formData,
                      starterCode: {
                        ...formData.starterCode,
                        python: e.target.value
                      }
                    })}
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium">Java</label>
                  <Textarea
                    value={formData.starterCode.java}
                    onChange={(e) => setFormData({
                      ...formData,
                      starterCode: {
                        ...formData.starterCode,
                        java: e.target.value
                      }
                    })}
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      {editingQuestion ? "Updating..." : "Creating..."}
                    </>
                  ) : editingQuestion ? (
                    "Update Question"
                  ) : (
                    "Create Question"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* QUESTIONS LIST */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No questions created yet
          </div>
        ) : (
          <div className="grid gap-4">
            {questions.map((question) => (
              <div key={question.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{question.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        question.difficulty === "easy" 
                          ? "bg-green-100 text-green-800" 
                          : question.difficulty === "medium" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-red-100 text-red-600"
                      }`}>
                        {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                      </span>
                      {question.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(question)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(question.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {question.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}