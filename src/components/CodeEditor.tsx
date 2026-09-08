import { LANGUAGES } from "@/constants";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { AlertCircleIcon, BookIcon, LightbulbIcon } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useCodingEditor } from "../hooks/useCodingEditor";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

interface CodeEditorProps {
  interviewId?: Id<"interviews">;
}

function CodeEditor({ interviewId }: CodeEditorProps) {
  const {
    language,
    code,
    selectedQuestion,
    scheduledQuestions,
    isSaving,
    isLoading,
    noQuestions,
    noSelectedQuestion,
    isSubmitted,
    formattedTime,
    handleQuestionChange,
    handleLanguageChange,
    handleCodeChange,
    handleFinalSubmit,
  } = useCodingEditor({ interviewId });

  const { theme } = useTheme();
  const [editorTheme, setEditorTheme] = useState<"vs" | "vs-dark">("vs-dark");

  useEffect(() => {
    const updateTheme = () => {
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setEditorTheme(prefersDark ? "vs-dark" : "vs");
      } else {
        setEditorTheme(theme === "dark" ? "vs-dark" : "vs");
      }
    };
    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (theme === "system") {
        updateTheme();
      }
    };
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  if (isSubmitted) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Interview Submitted</h2>
        <p className="text-muted-foreground">
          Your coding interview has been successfully submitted. You can now close this window.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6 text-center">Loading questions...</div>;
  }

  if (noQuestions) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No coding questions have been scheduled for this interview.
      </div>
    );
  }

  if (noSelectedQuestion || !selectedQuestion) {
    return <div className="p-6 text-center">Select a question to begin</div>;
  }

  const { title, description, examples, constraints } = selectedQuestion;

  return (
    <ResizablePanelGroup direction="vertical" className="min-h-[calc(100vh-4rem-1px)]">
      <ResizablePanel>
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                    {isSaving && (
                      <span className="text-xs text-muted-foreground">Saving...</span>
                    )}
                    {scheduledQuestions.length === 1 && (
                      <span className="text-xs text-muted-foreground">(Only question)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Choose your language and solve the problem
                    </p>
                    <div className="text-sm font-medium text-red-500">
                      Time Left: {formattedTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {scheduledQuestions.length > 1 ? (
                    <Select
                      value={selectedQuestion?.id || ""}
                      onValueChange={handleQuestionChange}
                      disabled={scheduledQuestions.length <= 1}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue
                          placeholder={
                            scheduledQuestions.length <= 1 ? "Only question" : "Select question"
                          }
                        >
                          {selectedQuestion?.title}
                        </SelectValue>
                      </SelectTrigger>
                      {scheduledQuestions.length > 1 && (
                        <SelectContent>
                          {scheduledQuestions.map((q) => (
                            <SelectItem key={q.id} value={q.id}>
                              {q.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      )}
                    </Select>
                  ) : (
                    <div className="w-[180px] text-sm text-muted-foreground px-3 py-2">
                      {title}
                    </div>
                  )}

                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <img
                            src={`/${language}.png`}
                            alt={language}
                            className="w-5 h-5 object-contain"
                          />
                          {LANGUAGES.find((l) => l.id === language)?.name}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          <div className="flex items-center gap-2">
                            <img
                              src={`/${lang.id}.png`}
                              alt={lang.name}
                              className="w-5 h-5 object-contain"
                            />
                            {lang.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleFinalSubmit}
                    className={`bg-green-700  rounded-md px-4 py-2 font-medium ${
                                  isSaving || isSubmitted
                                    ? 'opacity-100 '
                                    : 'opacity-100 cursor-pointer'
                                }`}
                  >
                    Final Submit
                  </Button>
                </div>
              </div>

              {/* Problem Description */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <BookIcon className="h-5 w-5 text-primary/80" />
                  <CardTitle>Problem Description</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line">{description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Examples */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-full w-full rounded-md border">
                    <div className="p-4 space-y-4">
                      {examples.map((example, index) => (
                        <div key={index} className="space-y-2">
                          <p className="font-medium text-sm">Example {index + 1}:</p>
                          <ScrollArea className="h-full w-full rounded-md">
                            <pre className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                              <div>Input: {example.input}</div>
                              <div>Output: {example.output}</div>
                              {example.explanation && (
                                <div className="pt-2 text-muted-foreground">
                                  Explanation: {example.explanation}
                                </div>
                              )}
                            </pre>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                    <ScrollBar />
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Constraints */}
              {constraints && constraints.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <AlertCircleIcon className="h-5 w-5 text-blue-500" />
                    <CardTitle>Constraints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1.5 text-sm marker:text-muted-foreground">
                      {constraints.map((constraint, index) => (
                        <li key={index}>{constraint}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <ScrollBar />
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Code Editor */}
      <ResizablePanel defaultSize={60} maxSize={100}>
        <div className="h-full relative">
          <Editor
            height={"100%"}
            defaultLanguage={language}
            language={language}
            theme={editorTheme}
            value={code}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 18,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              wordWrap: "on",
              wrappingIndent: "indent",
            }}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default CodeEditor;