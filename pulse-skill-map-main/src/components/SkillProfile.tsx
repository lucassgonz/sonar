import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, TrendingUp, Brain, Code } from "lucide-react";

const skillCategories = [
  {
    category: "Technical Skills",
    icon: Code,
    skills: [
      { name: "React & TypeScript", confidence: 92, trend: "+8%" },
      { name: "Python & Data Science", confidence: 85, trend: "+12%" },
      { name: "Cloud Architecture", confidence: 78, trend: "+5%" },
      { name: "API Design", confidence: 88, trend: "+3%" },
    ],
  },
  {
    category: "Soft Skills",
    icon: Brain,
    skills: [
      { name: "Leadership & Mentoring", confidence: 89, trend: "+15%" },
      { name: "Cross-functional Collaboration", confidence: 94, trend: "+6%" },
      { name: "Strategic Planning", confidence: 82, trend: "+9%" },
      { name: "Public Speaking", confidence: 76, trend: "+18%" },
    ],
  },
];

export const SkillProfile = () => {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Your Skill Profile</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            AI-powered analysis with confidence scores and evidence trails
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold text-foreground">47</span>
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
          {skillCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card key={idx} className="border-border/50 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {category.skills.map((skill, skillIdx) => (
                    <div key={skillIdx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground">{skill.name}</span>
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1 text-accent" />
                            {skill.trend}
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold text-primary">{skill.confidence}%</span>
                      </div>
                      <Progress value={skill.confidence} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {/* Evidence Trail */}
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Evidence Trail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gradient-hero rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">GitHub: 15 React projects analyzed</p>
                  <p className="text-xs text-muted-foreground">Contributed to large-scale applications with TypeScript</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gradient-hero rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">LinkedIn: Leadership role mentioned 8 times</p>
                  <p className="text-xs text-muted-foreground">Managed cross-functional teams in recent positions</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gradient-hero rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Blog: 12 technical articles published</p>
                  <p className="text-xs text-muted-foreground">Deep expertise in cloud architecture patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
