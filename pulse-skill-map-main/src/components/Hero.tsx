import { UploadBox } from "./UploadBox";
import { FloatingParticles } from "./FloatingParticles";
import { Hero3DIntro, ParticleField } from "./Hero3DIntro";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";

// Particle background covering the entire viewport
const ParticleFieldWrapper = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 0, 250]} fov={75} />
        <ParticleField scrollProgress={0} />
      </Canvas>
    </div>
  );
};

export const Hero = () => {
  return (
    <section className="relative min-h-screen pt-20 flex items-center overflow-hidden bg-gradient-to-br from-gradient-from to-gradient-to">
      {/* Full-screen particle background */}
      <ParticleFieldWrapper />
      <FloatingParticles />
      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Content - 3D Character Animation */}
        <div className="max-w-5xl mx-auto mb-16 animate-fade-in">
          <Hero3DIntro />
        </div>

        {/* Upload Section */}
        <div 
          id="upload-section" 
          className="scroll-mt-20 animate-fade-in" 
          style={{ animationDelay: "0.4s" }}
        >
          <UploadBox />
        </div>
      </div>
    </section>
  );
};
