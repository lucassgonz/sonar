import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Target, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const JobMatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState(
    location.state?.jobDescription || localStorage.getItem('pendingJobDescription') || ""
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use job matching",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
      setUser(session.user);
    };
    checkAuth();
  }, [navigate, toast]);

  // Clear localStorage on mount if job description exists
  useEffect(() => {
    if (jobDescription.trim()) {
      localStorage.removeItem('pendingJobDescription');
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use job matching",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Call match-job backend function
      const { data, error } = await supabase.functions.invoke('match-job', {
        body: {
          job_description: jobDescription,
          user_id: user.id
        }
      });

      if (error) {
        throw error;
      }

      // Transform the backend response to match UI expectations
      const transformedResult = {
        matchScore: data.match_score,
        skillsYouHave: data.matching_skills.map((s: any) => ({
          name: s.skill,
          confidence: Math.round(s.confidence * 100)
        })),
        skillsMissing: data.missing_skills.map((s: any) => ({
          name: s.skill,
          priority: s.priority,
          recommendation: `Priority: ${s.priority}. ${s.learning_time ? `Estimated learning time: ${s.learning_time}` : 'Start learning this skill to improve your match.'}`
        })),
        recommendations: data.recommendations
      };

      setMatchResult(transformedResult);

      toast({
        title: "Analysis complete!",
        description: `Match score: ${data.match_score}%`,
      });
    } catch (error: any) {
      console.error("Error matching job:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze job match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, jobDescription, navigate, toast]);

  // Auto-trigger analysis if job description was passed from Profile page
  useEffect(() => {
    if (user && jobDescription.trim() && !matchResult && !isAnalyzing) {
      handleAnalyze();
    }
  }, [user, jobDescription, matchResult, isAnalyzing, handleAnalyze]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Job Matcher
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Paste a job description to see how well your skills match
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Input Section */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] resize-y"
              />
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Match"}
              </Button>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isAnalyzing && (
            <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
              <p className="text-lg font-medium text-foreground">
                Analyzing job match...
              </p>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {matchResult && !isAnalyzing && (
            <div className="space-y-6 animate-fade-in">
              {/* Match Score - BIG NUMBER */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-2xl">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center space-y-6">
                    <div className="relative inline-flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-30 animate-pulse"></div>
                      <div className="relative w-48 h-48 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                        <span className="text-7xl font-bold text-primary-foreground">
                          {matchResult.matchScore}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-foreground mb-3">Overall Match Score</h3>
                      <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        {matchResult.matchScore >= 80 
                          ? "🎉 Excellent match! You have most of the required skills."
                          : matchResult.matchScore >= 60
                          ? "✨ Good match! Consider strengthening a few key areas."
                          : "💪 Some gaps exist, but with training you could qualify."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills You Have */}
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Skills You Have
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {matchResult.skillsYouHave.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No matching skills found</p>
                      <p className="text-sm mt-1">
                        This job requires skills outside your current profile. 
                        Check the Skills Gap Analysis below to see what's needed.
                      </p>
                    </div>
                  ) : (
                    matchResult.skillsYouHave.map((skill: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{skill.name}</span>
                          <span className="text-sm font-semibold text-primary">{skill.confidence}%</span>
                        </div>
                        <Progress value={skill.confidence} className="h-2" />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Gap Analysis */}
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    Skills Gap Analysis
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Missing skills with personalized learning paths
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {matchResult.skillsMissing.map((skill: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="p-4 border-2 border-destructive/20 bg-destructive/5 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="destructive"
                            className="px-3 py-1 font-bold"
                          >
                            GAP
                          </Badge>
                          <span className="font-semibold text-lg text-foreground">{skill.name}</span>
                        </div>
                        <Badge 
                          variant={skill.priority === "high" ? "destructive" : skill.priority === "medium" ? "default" : "outline"}
                          className="capitalize"
                        >
                          {skill.priority} priority
                        </Badge>
                      </div>
                      <div className="pl-16 border-l-2 border-primary/30 ml-6">
                        <p className="text-sm text-muted-foreground font-medium">
                          📚 Personalized Learning Path:
                        </p>
                        <p className="text-sm text-foreground mt-1">
                          {skill.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {matchResult.recommendations.map((rec: string, idx: number) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gradient-hero rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMatchResult(null);
                    setJobDescription("");
                  }}
                >
                  Try Another Job
                </Button>
                <Button onClick={() => navigate("/profile")}>
                  View Full Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatcher;