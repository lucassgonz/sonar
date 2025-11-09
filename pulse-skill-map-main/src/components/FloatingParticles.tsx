import { useEffect, useState } from "react";

interface Particle {
  id: number;
  skill: string;
  left: string;
  top: string;
  size: "small" | "medium" | "large";
  duration: number;
  delay: number;
}

const skills = [
  "React", "Python", "Leadership", "Design", "Analytics", 
  "Communication", "TypeScript", "Problem Solving", "Creativity",
  "Teamwork", "Node.js", "Project Management", "Strategy",
  "Data Analysis", "Marketing", "SQL", "UX Design",
  "Machine Learning", "Agile", "Git", "AWS", "Docker",
  "Writing", "Public Speaking", "Research", "Innovation"
];

const getRandomSize = (): "small" | "medium" | "large" => {
  const rand = Math.random();
  if (rand < 0.5) return "small";
  if (rand < 0.8) return "medium";
  return "large";
};

const sizeClasses = {
  small: "w-1 h-1",
  medium: "w-1.5 h-1.5",
  large: "w-2 h-2"
};

export const FloatingParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Generate particles
    const particleCount = isMobile ? 12 : 25;
    const generatedParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];
      generatedParticles.push({
        id: i,
        skill: randomSkill,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: getRandomSize(),
        duration: 20 + Math.random() * 20, // 20-40s
        delay: Math.random() * 5 // 0-5s delay
      });
    }

    setParticles(generatedParticles);

    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobile]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute ${sizeClasses[particle.size]}
            rounded-full
            bg-primary/20 dark:bg-primary/30
            animate-float`}
          style={{
            left: particle.left,
            top: particle.top,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            willChange: "transform"
          }}
        />
      ))}
      
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -30px) rotate(5deg);
          }
          50% {
            transform: translate(-15px, -60px) rotate(-5deg);
          }
          75% {
            transform: translate(25px, -40px) rotate(3deg);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-float {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};