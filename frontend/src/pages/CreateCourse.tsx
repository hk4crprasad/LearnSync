import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api, Topic } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, BookOpen, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdCourseId, setCreatedCourseId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty_level: "beginner" as "beginner" | "intermediate" | "advanced",
  });

  const [topics, setTopics] = useState<Topic[]>([
    {
      title: "",
      description: "",
      difficulty_level: "beginner",
      estimated_duration: 60,
    },
  ]);

  const addTopic = () => {
    setTopics([
      ...topics,
      {
        title: "",
        description: "",
        difficulty_level: "beginner",
        estimated_duration: 60,
      },
    ]);
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const updateTopic = (index: number, field: keyof Topic, value: string | number) => {
    const newTopics = [...topics];
    newTopics[index] = { ...newTopics[index], [field]: value };
    setTopics(newTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (topics.some((t) => !t.title || !t.description)) {
      toast.error("Please fill in all topic details");
      return;
    }

    try {
      setIsSubmitting(true);
      const createdCourse = await api.createCourse({
        ...formData,
        teacher_id: user?.id,
        topics,
      });
      setCreatedCourseId(createdCourse.id);
      setShowSuccessDialog(true);
      toast.success("Course created successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create course");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCourseId = () => {
    navigator.clipboard.writeText(createdCourseId);
    setCopied(true);
    toast.success("Course ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseDialog = () => {
    setShowSuccessDialog(false);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          
          <div className="flex items-center gap-3 animate-fade-up">
            <BookOpen className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Create New Course</h1>
              <p className="text-white/90">Add a new course to the catalog</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card className="animate-fade-up">
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Basic details about the course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to Python"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what students will learn..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Programming, Data Science"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level *</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, difficulty_level: value })
                    }
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
              </div>
            </CardContent>
          </Card>

          {/* Topics */}
          <Card className="animate-fade-up" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Topics</CardTitle>
                  <CardDescription>Add topics that will be covered in this course</CardDescription>
                </div>
                <Button type="button" onClick={addTopic} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {topics.map((topic, index) => (
                <Card key={index} className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Topic {index + 1}</CardTitle>
                      {topics.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTopic(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Topic Title *</Label>
                      <Input
                        value={topic.title}
                        onChange={(e) => updateTopic(index, "title", e.target.value)}
                        placeholder="e.g., Python Basics"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Textarea
                        value={topic.description}
                        onChange={(e) => updateTopic(index, "description", e.target.value)}
                        placeholder="What will be covered in this topic..."
                        rows={2}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Difficulty Level</Label>
                        <Select
                          value={topic.difficulty_level}
                          onValueChange={(value) => updateTopic(index, "difficulty_level", value)}
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
                        <Label>Estimated Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={topic.estimated_duration}
                          onChange={(e) =>
                            updateTopic(index, "estimated_duration", parseInt(e.target.value) || 0)
                          }
                          min={1}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Course Created Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Share this Course ID with your students so they can access the course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-id" className="text-sm font-medium">
                Course ID
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="course-id"
                  value={createdCourseId}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleCopyCourseId}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Students can use this ID to directly access and enroll in your course
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
              >
                Go to Admin Panel
              </Button>
              <Button
                onClick={() => navigate(`/courses/${createdCourseId}`)}
                className="flex-1"
              >
                View Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCourse;
