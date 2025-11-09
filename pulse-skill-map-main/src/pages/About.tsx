import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, TrendingUp, Users, Lightbulb } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Title Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent animate-gradient">
              Sonara: Unlocking the Future of Work
            </span>
          </h1>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          {/* Our Motivation */}
          <section className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-gradient">Our Motivation</h2>
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  The professional world is undergoing a critical shift: moving from credential-based hiring to skills-based talent management. Yet, the vast majority of human capability—expertise gained through projects, mentorship, and informal learning—remains hidden, undocumented, or unutilized.
                </p>
                <p>
                  Traditional systems and resumes capture only a fraction of what people truly know, leading to significant friction for organizations attempting to staff projects, identify internal experts, or plan effective training programs.
                </p>
                <p className="text-foreground font-medium text-lg">
                  Sonara was founded to answer one simple, yet powerful question: "What am I, or my team, truly good at?"
                </p>
              </CardContent>
            </Card>
          </section>

          {/* The Sonara Solution */}
          <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-3xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-gradient">The Sonara Solution</h2>
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6 space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Sonara is a next-generation dynamic intelligence platform designed to discover, validate, and visualize the full scope of human expertise. Our approach is defined by transparency, confidence, and actionability.
                </p>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">Core Capabilities:</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Multi-Source Aggregation</h4>
                        <p className="text-muted-foreground">
                          We go beyond the CV, synthesizing data from diverse sources (mocked internal goals, public profiles, project logs, etc.) to build a holistic view of the individual.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Explicit & Implicit Skill Extraction</h4>
                        <p className="text-muted-foreground">
                          Using sophisticated data synthesis and relationship mapping, Sonara extracts stated skills while also uncovering the implicit connections between them—the critical expertise that often goes unmentioned.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Dynamic Profiles with Evidence</h4>
                        <p className="text-muted-foreground">
                          Every skill is assigned a Confidence Score and linked to an Evidence Trail, allowing users and organizations to trust the data and easily correct any platform-detected inconsistencies.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Coaching & Action</h4>
                        <p className="text-muted-foreground">
                          We transform skills data into strategic guidance, instantly running Gap Analyses against target roles and providing prioritized, personalized learning recommendations (like mock SAP Learning Hub courses) to drive career acceleration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Why It Matters */}
          <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-3xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-gradient">Why It Matters (The Corporate Advantage)</h2>
            <Card className="border-border/50 bg-card">
              <CardContent className="pt-6 space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Sonara provides the essential infrastructure for organizations to thrive in the skills-first economy:
                </p>

                <div className="space-y-6">
                  <div className="border-l-4 border-primary pl-6">
                    <h4 className="font-semibold text-foreground mb-2">For Individuals:</h4>
                    <p className="text-muted-foreground">
                      Discover hidden strengths, visualize expertise with the Skill Star Map, and strategically plan career advancement with quantifiable metrics like the Role Readiness Index.
                    </p>
                  </div>

                  <div className="border-l-4 border-accent pl-6">
                    <h4 className="font-semibold text-foreground mb-2">For Talent Management:</h4>
                    <p className="text-muted-foreground">
                      Quickly match the perfect internal expert to any opportunity, assemble complementary project teams in minutes, and eliminate the friction of talent search.
                    </p>
                  </div>

                  <div className="border-l-4 border-primary pl-6">
                    <h4 className="font-semibold text-foreground mb-2">For Learning & Development:</h4>
                    <p className="text-muted-foreground">
                      Pinpoint organizational skill gaps with precision and automatically generate personalized upskilling paths, ensuring training investment delivers maximum impact.
                    </p>
                  </div>
                </div>

                <p className="text-foreground font-medium text-lg pt-4">
                  We are building the infrastructure that empowers people and companies to succeed. Sonara is the dynamic platform that unlocks human potential—one verifiable skill at a time.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
