import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api, Course } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, CheckCircle2, XCircle, BookOpen, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GeneratedQuestion {
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  options?: Array<{ text: string; is_correct: boolean }>;
  correct_answer: string;
  explanation?: string;
  points: number;
}

interface Answer {
  questionIndex: number;
  answer: string;
}

const PracticeAssessment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get("courseId");
  
  const [step, setStep] = useState<"setup" | "taking" | "results">("setup");
  const [isGenerating, setIsGenerating] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [config, setConfig] = useState({
    topic: "",
    course_id: courseIdParam || "",
    difficulty_level: "beginner",
    num_questions: 5,
    question_type: "multiple_choice",
  });
  
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courseIdParam && courses.length > 0) {
      const course = courses.find(c => c.id === courseIdParam);
      if (course) {
        setSelectedCourse(course);
        setConfig(prev => ({ ...prev, course_id: courseIdParam }));
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
    setConfig({ ...config, course_id: courseId });
  };

  const generatePracticeQuestions = async () => {
    if (!config.topic) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await api.generateQuestions({
        topic: config.topic,
        course_description: selectedCourse?.description || `Practice questions for ${config.topic}`,
        difficulty_level: config.difficulty_level,
        num_questions: config.num_questions,
        question_type: config.question_type,
      });

      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        setStep("taking");
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setSelectedAnswer("");
        setShowExplanation(false);
        toast.success(`Generated ${result.questions.length} practice questions!`);
      } else {
        toast.error("No questions generated");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    // Save answer
    setAnswers([...answers, {
      questionIndex: currentQuestionIndex,
      answer: selectedAnswer
    }]);

    if (isCorrect) {
      setScore(score + currentQuestion.points);
    }

    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setShowExplanation(false);
    } else {
      setStep("results");
    }
  };

  const restartPractice = () => {
    setStep("setup");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer("");
    setShowExplanation(false);
    setScore(0);
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const percentageScore = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

  // Setup Step
  if (step === "setup") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">AI Practice Assessment</h1>
                  <p className="text-white/90">Generate personalized practice questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Setup Your Practice Session</CardTitle>
              <CardDescription>
                AI will generate custom questions based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="course">Course (Optional)</Label>
                <Select
                  value={config.course_id}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
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
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  placeholder="e.g., Python Functions, Calculus, World History"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={config.difficulty_level}
                    onValueChange={(value) => setConfig({ ...config, difficulty_level: value })}
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
                  <Label htmlFor="num_questions">Number of Questions</Label>
                  <Input
                    id="num_questions"
                    type="number"
                    value={config.num_questions}
                    onChange={(e) => setConfig({ ...config, num_questions: Math.min(parseInt(e.target.value), 10) })}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question_type">Question Type</Label>
                <Select
                  value={config.question_type}
                  onValueChange={(value) => setConfig({ ...config, question_type: value })}
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
                onClick={generatePracticeQuestions}
                disabled={isGenerating || !config.topic}
                className="w-full gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Start Practice Session
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Taking Assessment Step
  if (step === "taking" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Practice: {config.topic}</h1>
                <p className="text-white/90">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Score: {score}/{totalPoints}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{currentQuestion.question_text}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentQuestion.question_type === "multiple_choice" ? "Multiple Choice" : "True/False"}</Badge>
                    <Badge variant="secondary">{currentQuestion.points} points</Badge>
                    <Badge>{config.difficulty_level}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {currentQuestion.options?.map((option, index) => {
                  const isSelected = selectedAnswer === option.text;
                  const isCorrect = option.text === currentQuestion.correct_answer;
                  
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      className={`w-full justify-start text-left h-auto py-4 ${
                        showExplanation
                          ? isCorrect
                            ? "border-green-500 bg-green-50 hover:bg-green-50"
                            : isSelected
                            ? "border-red-500 bg-red-50 hover:bg-red-50"
                            : ""
                          : ""
                      }`}
                      onClick={() => !showExplanation && handleAnswerSelect(option.text)}
                      disabled={showExplanation}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{option.text}</span>
                        {showExplanation && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {showExplanation && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {showExplanation && currentQuestion.explanation && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{currentQuestion.explanation}</p>
                    {selectedAnswer !== currentQuestion.correct_answer && (
                      <p className="text-sm mt-2 font-medium text-green-700">
                        Correct Answer: {currentQuestion.correct_answer}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between pt-4">
                {!showExplanation ? (
                  <>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                      Exit Practice
                    </Button>
                    <Button
                      onClick={checkAnswer}
                      disabled={!selectedAnswer}
                    >
                      Check Answer
                    </Button>
                  </>
                ) : (
                  <>
                    <div></div>
                    <Button onClick={nextQuestion}>
                      {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results Step
  if (step === "results") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
              <p className="text-white/90">Here's how you did</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-4xl mb-2">{percentageScore.toFixed(0)}%</CardTitle>
              <CardDescription>
                You scored {score} out of {totalPoints} points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Your Score</span>
                  <span className="font-medium">{percentageScore.toFixed(1)}%</span>
                </div>
                <Progress value={percentageScore} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {answers.filter((a, i) => a.answer === questions[i].correct_answer).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {answers.filter((a, i) => a.answer !== questions[i].correct_answer).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Incorrect</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-primary">
                      {questions.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Performance Feedback:</h3>
                <p className="text-sm text-muted-foreground">
                  {percentageScore >= 80
                    ? "🎉 Excellent work! You have a strong understanding of this topic."
                    : percentageScore >= 60
                    ? "👍 Good job! You're on the right track. Review the explanations for questions you missed."
                    : "💪 Keep practicing! Review the material and try again to improve your understanding."}
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={restartPractice} className="flex-1 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  New Practice
                </Button>
                <Button onClick={() => navigate("/dashboard")} className="flex-1">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default PracticeAssessment;
