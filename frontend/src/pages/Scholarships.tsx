import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Search, Calendar, DollarSign, Users, ArrowRight, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  eligibility: string[];
  category: string;
  applicationStatus?: "not_applied" | "applied" | "in_review" | "awarded";
  description: string;
  requirements: string[];
}

const MOCK_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "1",
    title: "Prime Minister's Scholarship Scheme",
    provider: "Ministry of Home Affairs, Govt of India",
    amount: "₹3,000/month",
    deadline: "2025-12-31",
    eligibility: ["Central Armed Police Forces wards", "60%+ marks", "Professional courses"],
    category: "merit",
    description: "Scholarship for wards and widows of Central Armed Police Forces and Assam Rifles personnel for pursuing professional degree courses.",
    requirements: ["Service certificate", "Academic marksheets", "Income certificate", "Aadhaar card"],
  },
  {
    id: "2",
    title: "INSPIRE Scholarship",
    provider: "Department of Science & Technology",
    amount: "₹80,000/year",
    deadline: "2025-11-15",
    eligibility: ["Top 1% in Class XII", "Science stream", "Age under 27"],
    category: "stem",
    description: "Innovation in Science Pursuit for Inspired Research (INSPIRE) for students pursuing Natural & Basic Sciences at BSc level.",
    requirements: ["Class XII marksheet", "College admission proof", "Bank account details", "Aadhaar card"],
    applicationStatus: "applied",
  },
  {
    id: "3",
    title: "National Means-cum-Merit Scholarship",
    provider: "Ministry of Education, Govt of India",
    amount: "₹12,000/year",
    deadline: "2025-12-15",
    eligibility: ["Class IX-XII students", "Family income <₹3.5 lakh", "55%+ in Class VIII"],
    category: "need_based",
    description: "Central sector scholarship to check dropout rates and encourage meritorious students from economically weaker sections.",
    requirements: ["Income certificate", "Previous year marksheet", "School certificate", "Bank passbook"],
  },
  {
    id: "4",
    title: "AICTE Pragati Scholarship for Girls",
    provider: "All India Council for Technical Education",
    amount: "₹50,000/year",
    deadline: "2025-11-30",
    eligibility: ["Female students", "Engineering/Technology", "Family income <₹8 lakh"],
    category: "diversity",
    description: "Scholarship to encourage girl students to pursue technical education. One girl child per family.",
    requirements: ["Income certificate", "Admission proof", "Class XII marksheet", "Aadhaar & bank details"],
    applicationStatus: "in_review",
  },
  {
    id: "5",
    title: "Post Matric Scholarship SC/ST/OBC",
    provider: "Department of Social Justice & Empowerment",
    amount: "₹1,000-₹3,000/month",
    deadline: "2025-12-20",
    eligibility: ["SC/ST/OBC students", "Post-matriculation", "Family income <₹2.5 lakh"],
    category: "need_based",
    description: "Financial assistance to SC/ST/OBC students studying in classes XI-XII and pursuing higher education.",
    requirements: ["Caste certificate", "Income certificate", "Previous marksheet", "Bonafide certificate"],
  },
  {
    id: "6",
    title: "IISER Kishore Vaigyanik Protsahan Yojana",
    provider: "Indian Institute of Science Education",
    amount: "₹7,000/month + ₹20,000/year",
    deadline: "2025-11-25",
    eligibility: ["Class XI-XII students", "Science stream", "KVPY exam qualified"],
    category: "stem",
    description: "Fellowship program to attract exceptionally talented students for research careers in basic sciences. Includes summer camp opportunities.",
    requirements: ["KVPY exam scorecard", "Class X & XI marksheets", "Research aptitude test", "Institute recommendation"],
    applicationStatus: "awarded",
  },
  {
    id: "7",
    title: "Begum Hazrat Mahal National Scholarship",
    provider: "Maulana Azad Education Foundation",
    amount: "₹5,000-₹6,000/year",
    deadline: "2025-12-10",
    eligibility: ["Minority community girls", "Class IX-XII", "Family income <₹2 lakh"],
    category: "diversity",
    description: "Scholarship for meritorious girls belonging to minority communities to pursue education from Class IX to XII.",
    requirements: ["Minority community certificate", "Income certificate", "Previous marksheet", "School certificate"],
  },
  {
    id: "8",
    title: "Swami Vivekananda Merit-cum-Means Scholarship",
    provider: "West Bengal Govt (Example State)",
    amount: "₹1,000-₹1,500/month",
    deadline: "2025-11-20",
    eligibility: ["West Bengal domicile", "75%+ in previous exam", "Family income <₹2.5 lakh"],
    category: "merit",
    description: "State scholarship for meritorious students from economically disadvantaged sections pursuing undergraduate/postgraduate courses.",
    requirements: ["Domicile certificate", "Income certificate", "Previous marksheets", "Aadhaar card"],
  },
];

const Scholarships = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);

  const filteredScholarships = MOCK_SCHOLARSHIPS.filter(scholarship => {
    const matchesSearch = scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || scholarship.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApply = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    toast.success(`Opening application for ${scholarship.title}`);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "applied":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Applied</Badge>;
      case "in_review":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Review</Badge>;
      case "awarded":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Awarded</Badge>;
      default:
        return <Badge variant="outline">Open</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "merit":
        return <TrendingUp className="h-4 w-4" />;
      case "stem":
        return <GraduationCap className="h-4 w-4" />;
      case "community":
        return <Users className="h-4 w-4" />;
      case "diversity":
        return <Users className="h-4 w-4" />;
      case "need_based":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  const stats = {
    total: MOCK_SCHOLARSHIPS.length,
    applied: MOCK_SCHOLARSHIPS.filter(s => s.applicationStatus === "applied").length,
    inReview: MOCK_SCHOLARSHIPS.filter(s => s.applicationStatus === "in_review").length,
    awarded: MOCK_SCHOLARSHIPS.filter(s => s.applicationStatus === "awarded").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Scholarships & Financial Aid</h1>
              <p className="text-white/90 text-lg mt-1">Find and apply for educational funding opportunities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Total scholarships</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.applied}</div>
              <p className="text-xs text-muted-foreground mt-1">Your applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.inReview}</div>
              <p className="text-xs text-muted-foreground mt-1">Under review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Awarded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.awarded}</div>
              <p className="text-xs text-muted-foreground mt-1">Congratulations!</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search scholarships</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search scholarships by title, provider, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="merit">Merit</TabsTrigger>
                  <TabsTrigger value="stem">STEM</TabsTrigger>
                  <TabsTrigger value="community">Community</TabsTrigger>
                  <TabsTrigger value="diversity">Diversity</TabsTrigger>
                  <TabsTrigger value="need_based">Need-Based</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Scholarships Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship) => (
            <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(scholarship.category)}
                    <Badge variant="secondary" className="text-xs capitalize">{scholarship.category.replace("_", " ")}</Badge>
                  </div>
                  {getStatusBadge(scholarship.applicationStatus)}
                </div>
                <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                <CardDescription>{scholarship.provider}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-bold text-green-600">
                    <DollarSign className="h-5 w-5" />
                    {scholarship.amount}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(scholarship.deadline).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{scholarship.description}</p>

                <div className="space-y-2">
                  <p className="text-xs font-medium">Eligibility:</p>
                  <div className="flex flex-wrap gap-1">
                    {scholarship.eligibility.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  {scholarship.applicationStatus === "awarded" ? (
                    <Button className="w-full" variant="outline" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Awarded
                    </Button>
                  ) : scholarship.applicationStatus === "in_review" ? (
                    <Button className="w-full" variant="outline" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      In Review
                    </Button>
                  ) : scholarship.applicationStatus === "applied" ? (
                    <Button className="w-full" variant="outline" disabled>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Applied
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleApply(scholarship)}>
                      Apply Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scholarships found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Modal (simplified for demo) */}
      {selectedScholarship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedScholarship.title}</CardTitle>
              <CardDescription>Application Requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedScholarship.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Required Documents</h4>
                <ul className="space-y-2">
                  {selectedScholarship.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Amount & Deadline</h4>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{selectedScholarship.amount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <span>Deadline: {new Date(selectedScholarship.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={() => {
                  toast.success("Application submitted successfully!");
                  setSelectedScholarship(null);
                }}>
                  Submit Application
                </Button>
                <Button variant="outline" onClick={() => setSelectedScholarship(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Scholarships;
