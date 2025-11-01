import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, Course, Question } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, FileText, Sparkles, Wand2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const CreateAssessment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get("courseId");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course_id: courseIdParam || "",
    topic: "",
    time_limit: 1800,
    passing_score: 70,
  });
  
  const [aiConfig, setAiConfig] = useState({
    topic: "",
    difficulty_level: "beginner",
    num_questions: 5,
    question_type: "multiple_choice",
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courseIdParam && courses.length > 0) {
      const course = courses.find(c => c.id === courseIdParam);
      if (course) {
        setSelectedCourse(course);
        setFormData(prev => ({
          ...prev,
          course_id: courseIdParam,
          title: `${course.title} Assessment`,
          description: `Assessment for ${course.title}`,
        }));
      }
    }
  }, [courseIdParam, courses]);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (error) {
      toast.error("Failed to load courses");
    }
  };

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
    setFormData({ ...formData, course_id: courseId });
  };

  const generateAIQuestions = async () => {
    if (!aiConfig.topic) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await api.generateQuestions({
        topic: aiConfig.topic,
        course_description: selectedCourse?.description || formData.description,
        difficulty_level: aiConfig.difficulty_level,
        num_questions: aiConfig.num_questions,
        question_type: aiConfig.question_type,
      });

      if (result.questions && result.questions.length > 0) {
        setQuestions([...questions, ...result.questions]);
        setShowAIDialog(false);
        toast.success(`Generated ${result.questions.length} questions!`);
      } else {
        toast.error("No questions generated");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "multiple_choice",
        options: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
        correct_answer: "",
        points: 10,
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    
    // Update correct_answer if options change
    if (field === "options") {
      const correctOption = value.find((opt: any) => opt.is_correct);
      if (correctOption) {
        updated[index].correct_answer = correctOption.text;
      }
    }
    
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    if (!updated[qIndex].options) updated[qIndex].options = [];
    updated[qIndex].options!.push({ text: "", is_correct: false });
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options!.filter((_, i) => i !== oIndex);
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
    const updated = [...questions];
    
    // If marking this option as correct, unmark others
    if (field === "is_correct" && value === true) {
      updated[qIndex].options!.forEach((opt, i) => {
        if (i !== oIndex) opt.is_correct = false;
      });
      updated[qIndex].correct_answer = updated[qIndex].options![oIndex].text;
    }
    
    updated[qIndex].options![oIndex] = {
      ...updated[qIndex].options![oIndex],
      [field]: value,
    };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    // Validate all questions have correct answers
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].correct_answer) {
        toast.error(`Question ${i + 1} is missing a correct answer`);
        return;
      }
    }

    setIsLoading(true);
    try {
      await api.createAssessment({
        ...formData,
        teacher_id: user.id,
        questions,
      });
      toast.success("Assessment created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create assessment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create Assessment</h1>
              <p className="text-white/90">Design a quiz or test with AI assistance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assessment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>Basic information about your assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chapter 1 Quiz"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this assessment covers"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={handleCourseChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic *</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Introduction to Variables"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time_limit">Time Limit (seconds) *</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    value={formData.time_limit}
                    onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                    min="60"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(formData.time_limit / 60)} minutes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passing_score">Passing Score (%) *</Label>
                  <Input
                    id="passing_score"
                    type="number"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions ({questions.length})</CardTitle>
                  <CardDescription>Add questions manually or generate with AI</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        AI Generate
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Wand2 className="h-5 w-5 text-primary" />
                          AI Question Generator
                        </DialogTitle>
                        <DialogDescription>
                          Let AI create high-quality questions for your assessment
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="ai_topic">Topic *</Label>
                          <Input
                            id="ai_topic"
                            value={aiConfig.topic}
                            onChange={(e) => setAiConfig({ ...aiConfig, topic: e.target.value })}
                            placeholder="e.g., Loops in Python"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select
                              value={aiConfig.difficulty_level}
                              onValueChange={(value) => setAiConfig({ ...aiConfig, difficulty_level: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="num_questions">Questions</Label>
                            <Input
                              id="num_questions"
                              type="number"
                              value={aiConfig.num_questions}
                              onChange={(e) => setAiConfig({ ...aiConfig, num_questions: parseInt(e.target.value) })}
                              min="1"
                              max="20"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="question_type">Question Type</Label>
                          <Select
                            value={aiConfig.question_type}
                            onValueChange={(value) => setAiConfig({ ...aiConfig, question_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="true_false">True/False</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          type="button"
                          onClick={generateAIQuestions}
                          disabled={isGenerating}
                          className="w-full gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Generate Questions
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button type="button" onClick={addQuestion} variant="default" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Manual
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Use AI to generate questions or add them manually
                  </p>
                </div>
              ) : (
                questions.map((question, qIndex) => (
                  <Card key={qIndex} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Question {qIndex + 1}</Badge>
                            <Badge variant="secondary">{question.points} points</Badge>
                            {question.question_type === "multiple_choice" ? (
                              <Badge>Multiple Choice</Badge>
                            ) : (
                              <Badge>True/False</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question Text *</Label>
                        <Textarea
                          value={question.question_text}
                          onChange={(e) => updateQuestion(qIndex, "question_text", e.target.value)}
                          placeholder="Enter your question"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Question Type</Label>
                          <Select
                            value={question.question_type}
                            onValueChange={(value) => updateQuestion(qIndex, "question_type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="true_false">True/False</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Points</Label>
                          <Input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateQuestion(qIndex, "points", parseInt(e.target.value))}
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Answer Options</Label>
                          {question.question_type === "multiple_choice" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(qIndex)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Option
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {question.options?.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <Input
                                value={option.text}
                                onChange={(e) => updateOption(qIndex, oIndex, "text", e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant={option.is_correct ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateOption(qIndex, oIndex, "is_correct", !option.is_correct)}
                              >
                                {option.is_correct && <CheckCircle2 className="h-4 w-4 mr-1" />}
                                {option.is_correct ? "Correct" : "Mark Correct"}
                              </Button>
                              {question.question_type === "multiple_choice" && question.options && question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-2">
                        <Label>Explanation (Optional)</Label>
                        <Textarea
                          value={question.explanation || ""}
                          onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                          placeholder="Explain why this is the correct answer"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || questions.length === 0}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Create Assessment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssessment;
