import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const colors = [
  "bg-primary",
  "bg-accent",
  "bg-secondary",
  "bg-primary/60",
  "bg-accent/60",
];

export const LoadingScreen = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate sparkle particles
    const generatedParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      generatedParticles.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 8 + 4, // 4-12px
        duration: Math.random() * 3 + 2, // 2-5s
        delay: Math.random() * 2, // 0-2s
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-30 animate-gradient-shift" 
           style={{ backgroundSize: "200% 200%" }} />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${particle.color} animate-pulse`}
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `sparkle ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center space-y-6 px-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
          </div>
          <span className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Sonara
          </span>
        </div>

        {/* Loading text */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-2xl font-semibold text-foreground">
            Loading your experience
          </h2>
          <p className="text-muted-foreground">
            Preparing something amazing...
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      <style>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8) translateY(0px);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) translateY(-20px);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
