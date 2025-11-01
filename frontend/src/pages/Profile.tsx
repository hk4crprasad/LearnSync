import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Loader2, Sparkles, Edit } from "lucide-react";
import { api, Recommendations } from "@/lib/api";
import { toast } from "sonner";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone_number: user?.phone_number || "",
    city: user?.city || "",
    state: user?.state || "",
    goals: user?.goals || "",
  });
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await api.getRecommendations();
        setRecommendations(data);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      }
    };

    fetchRecommendations();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser({
        ...formData,
        interests,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user?.full_name}</h1>
              <p className="text-white/90">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-fade-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="interests">Interests</Label>
                      <div className="flex gap-2">
                        <Input
                          id="interests"
                          placeholder="Add interest"
                          value={interestInput}
                          onChange={(e) => setInterestInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                        />
                        <Button type="button" onClick={addInterest} variant="secondary">
                          Add
                        </Button>
                      </div>
                      {interests.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {interests.map((interest) => (
                            <Badge
                              key={interest}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeInterest(interest)}
                            >
                              {interest} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goals">Learning Goals</Label>
                      <Input
                        id="goals"
                        name="goals"
                        value={formData.goals}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Full Recommendations */}
            {recommendations && (
              <Card className="animate-fade-up border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5" style={{ animationDelay: "100ms" }}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>AI Course Recommendations</CardTitle>
                  </div>
                  <CardDescription>
                    Personalized suggestions based on your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-foreground">
                    <div className="whitespace-pre-line text-sm leading-relaxed">
                      {recommendations.recommendations}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Academic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">College</span>
                  <span className="font-medium">{user?.college_name || "Not set"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Class/Grade</span>
                  <span className="font-medium">{user?.class_grade || "Not set"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Major</span>
                  <span className="font-medium">{user?.major_subject || "Not set"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-scale-in" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent>
                {user?.interests && user.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No interests added yet</p>
                )}
              </CardContent>
            </Card>

            <Card className="animate-scale-in" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <CardTitle>Learning Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {user?.goals || "No goals set yet"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
