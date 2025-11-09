import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, TrendingUp, Brain, Code, Edit2, Trash2, ArrowLeft, Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const mockSkillCategories = [
  {
    category: "Technical Skills",
    icon: Code,
    skills: [
      { 
        id: 1,
        name: "React & TypeScript", 
        confidence: 92, 
        trend: "+8%",
        evidence: "Found in 3 projects on GitHub, mentioned in resume under 'Key Technologies'"
      },
      { 
        id: 2,
        name: "Python & Data Science", 
        confidence: 85, 
        trend: "+12%",
        evidence: "Listed in resume skills section, 5 Python projects on GitHub"
      },
      { 
        id: 3,
        name: "Cloud Architecture", 
        confidence: 78, 
        trend: "+5%",
        evidence: "AWS certification mentioned in resume, cloud projects in portfolio"
      },
      { 
        id: 4,
        name: "API Design", 
        confidence: 88, 
        trend: "+3%",
        evidence: "RESTful API development mentioned in 2 job experiences"
      },
    ],
  },
  {
    category: "Soft Skills",
    icon: Brain,
    skills: [
      { 
        id: 5,
        name: "Leadership & Mentoring", 
        confidence: 89, 
        trend: "+15%",
        evidence: "Managed team of 5 developers, mentioned in LinkedIn recommendations"
      },
      { 
        id: 6,
        name: "Cross-functional Collaboration", 
        confidence: 94, 
        trend: "+6%",
        evidence: "Worked with product, design, and engineering teams in multiple roles"
      },
      { 
        id: 7,
        name: "Strategic Planning", 
        confidence: 82, 
        trend: "+9%",
        evidence: "Led quarterly planning initiatives in current role"
      },
      { 
        id: 8,
        name: "Public Speaking", 
        confidence: 76, 
        trend: "+18%",
        evidence: "Conference talks listed, tech meetup organizer"
      },
    ],
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [skillCategories, setSkillCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [savedJobDescription, setSavedJobDescription] = useState<string | null>(
    location.state?.jobDescription || localStorage.getItem('pendingJobDescription') || null
  );

  useEffect(() => {
    // Check authentication and fetch skills
    const initProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await fetchSkills(session.user.id);
    };

    initProfile();
  }, [navigate]);

  // Clear localStorage when navigating to JobMatcher
  useEffect(() => {
    return () => {
      if (savedJobDescription) {
        localStorage.removeItem('pendingJobDescription');
      }
    };
  }, [savedJobDescription]);

  const fetchSkills = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Use the get-profile backend function
      const { data: profileData, error } = await supabase.functions.invoke('get-profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      const skills = profileData.skills || [];

      // Group skills by category
      const grouped = skills.reduce((acc: any, skill: any) => {
        const category = skill.category || "Other";
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1) + " Skills";
        
        if (!acc[categoryName]) {
          acc[categoryName] = {
            category: categoryName,
            icon: category === "technical" || category === "language" || category === "tool" ? Code : Brain,
            skills: []
          };
        }
        
        acc[categoryName].skills.push({
          id: skill.id,
          name: skill.skill_name,
          confidence: parseInt(skill.confidence) || 85,
          trend: skill.trend || "+0%",
          evidence: `Source: ${skill.source} - ${categoryName}`
        });
        return acc;
      }, {});

      setSkillCategories(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast({
        title: "Error loading skills",
        description: "Could not load your skills. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSkill = async (categoryIndex: number, skillId: string) => {
    if (!user) return;

    try {
      // Use delete-skill backend function
      const { error } = await supabase.functions.invoke('delete-skill', {
        body: {
          skill_id: skillId,
          user_id: user.id
        }
      });

      if (error) throw error;

      setSkillCategories(prev => 
        prev.map((category, idx) => 
          idx === categoryIndex 
            ? { ...category, skills: category.skills.filter(s => s.id !== skillId) }
            : category
        )
      );

      toast({
        title: "Skill deleted",
        description: "The skill has been removed from your profile.",
      });
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast({
        title: "Error",
        description: "Could not delete skill. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditSkill = (skillName: string) => {
    // TODO: Implement edit functionality
    console.log("Edit skill:", skillName);
  };

  const totalSkills = skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Upload
          </Button>
          <Button 
            variant="default"
            onClick={() => navigate("/job-matcher", { 
              state: { jobDescription: savedJobDescription } 
            })}
            className="gap-2 relative"
          >
            <Target className="w-4 h-4" />
            Match with Job
            {savedJobDescription && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground">
                Ready
              </Badge>
            )}
          </Button>
        </div>

        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Your Skill Profile
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-powered analysis with confidence scores and evidence trails
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {isLoading ? (
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-12 pb-12 text-center">
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
                <h3 className="text-2xl font-semibold mb-2 text-foreground">Loading your skills...</h3>
              </CardContent>
            </Card>
          ) : skillCategories.length === 0 ? (
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-12 pb-12 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-semibold mb-2 text-foreground">No Skills Yet</h3>
                <p className="text-muted-foreground mb-6">Import your GitHub profile to generate your skill profile</p>
                <Button onClick={() => navigate("/")}>
                  Import from GitHub
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold text-foreground">{totalSkills}</span>
                </div>
                <p className="text-muted-foreground">Skills Identified</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="text-3xl font-bold text-foreground">23</span>
                </div>
                <p className="text-muted-foreground">Hidden Talents</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold text-foreground">8</span>
                </div>
                <p className="text-muted-foreground">Sources Analyzed</p>
              </CardContent>
            </Card>
          </div>

          {/* Skill Categories */}
          <TooltipProvider>
            {skillCategories.map((category, categoryIdx) => {
              const Icon = category.icon;
              return (
                <Card key={categoryIdx} className="border-border/50 bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {category.skills.map((skill) => (
                      <div key={skill.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-medium text-foreground cursor-help hover:text-primary transition-colors">
                                  {skill.name}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-sm">{skill.evidence}</p>
                              </TooltipContent>
                            </Tooltip>
                            <Badge variant="outline" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1 text-accent" />
                              {skill.trend}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-primary">{skill.confidence}%</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditSkill(skill.name)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteSkill(categoryIdx, skill.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <Progress value={skill.confidence} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </TooltipProvider>

          {/* Evidence Trail */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Evidence Trail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gradient-hero rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Resume: 15 technical skills identified</p>
                  <p className="text-xs text-muted-foreground">Parsed from work experience and skills sections</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gradient-hero rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Document: 8 soft skills detected</p>
                  <p className="text-xs text-muted-foreground">Found in achievements and responsibilities descriptions</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gradient-hero rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Analysis: 12 hidden talents discovered</p>
                  <p className="text-xs text-muted-foreground">Skills inferred from project descriptions and contexts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;