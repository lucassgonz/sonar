import { Upload, Brain, LineChart, Award } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Connect Your Sources",
    description: "Upload your CV, link LinkedIn, GitHub, or other professional profiles. The more sources, the better the analysis.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our NLP engine extracts both explicit and implicit skills from your data, identifying hidden talents and expertise.",
  },
  {
    icon: LineChart,
    title: "Dynamic Profile",
    description: "Get a comprehensive skill profile with confidence scores, evidence trails, and skill gap analysis.",
  },
  {
    icon: Award,
    title: "Unlock Opportunities",
    description: "Match with opportunities, build better CVs, get personalized learning paths, and discover your unique strengths.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">How It Works</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Four simple steps to discovering your hidden potential
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />
                )}

                <div className="bg-card rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 relative z-10 border border-border/50 h-full">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
