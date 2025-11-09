import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const ParticleField = ({ scrollProgress = 0 }: { scrollProgress?: number }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const { theme } = useTheme();
  const transitionProgress = useRef(1);
  const isTransitioning = useRef(false);
  const targetColors = useRef<Float32Array | null>(null);
  const startColors = useRef<Float32Array | null>(null);

  const particleCount = 5000;

  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 1000;
      positions[i3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i3 + 2] = (Math.random() - 0.5) * 1000;
    }

    return positions;
  }, []);

  const generateColors = (isDark: boolean) => {
    const colors = new Float32Array(particleCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      if (isDark) {
        // Dark mode: bright blue/cyan/purple
        color.setHSL(0.6 + 0.1 * Math.random(), 0.7, 0.6);
      } else {
        // Light mode: deep purple/indigo/blue
        color.setHSL(0.65 + 0.08 * Math.random(), 0.8, 0.35);
      }
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    return colors;
  };

  useEffect(() => {
    if (!particlesRef.current) return;
    
    // Store current colors as start colors
    const currentColors = particlesRef.current.geometry.attributes.color.array as Float32Array;
    startColors.current = new Float32Array(currentColors);
    
    // Generate target colors
    targetColors.current = generateColors(theme === 'dark');
    
    // Start transition
    isTransitioning.current = true;
    transitionProgress.current = 0;
  }, [theme]);

  const colors = useMemo(() => {
    return generateColors(theme === 'dark');
  }, []);

  useFrame(({ camera }) => {
    if (particlesRef.current) {
      camera.position.x += (mouseX.current - camera.position.x) * 0.01;
      camera.position.y += (-mouseY.current - camera.position.y) * 0.01;
      camera.lookAt(0, 0, 0);

      // Slow down rotation based on scroll progress
      const rotationSpeed = 1 - scrollProgress * 0.7;
      particlesRef.current.rotation.x += 0.0005 * rotationSpeed;
      particlesRef.current.rotation.y += 0.001 * rotationSpeed;

      // Handle color transition animation
      if (isTransitioning.current && targetColors.current && startColors.current) {
        transitionProgress.current += 0.02; // Smooth transition speed
        
        if (transitionProgress.current >= 1) {
          transitionProgress.current = 1;
          isTransitioning.current = false;
        }

        const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
        const progress = transitionProgress.current;
        
        // Ease-in-out interpolation
        const eased = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        for (let i = 0; i < particleCount * 3; i++) {
          colors[i] = startColors.current[i] + (targetColors.current[i] - startColors.current[i]) * eased;
        }
        
        particlesRef.current.geometry.attributes.color.needsUpdate = true;
      }

      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 2] += 0.5;
        if (positions[i3 + 2] > 500) {
          positions[i3 + 2] = -500;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const handleMouseMove = (event: MouseEvent) => {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX.current = (event.clientX - windowHalfX) * 0.5;
    mouseY.current = (event.clientY - windowHalfY) * 0.5;
  };

  useMemo(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Export ParticleField for use in other components
export { ParticleField };

export const Hero3DIntro = ({ scrollProgress = 0 }: { scrollProgress?: number }) => {
  const scrollToUpload = () => {
    const section = document.getElementById("upload-section");
    if (section) {
      section.classList.add("jump-in");
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => section.classList.remove("jump-in"), 1000);
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-8 drop-shadow-lg">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-300 animate-gradient">
            UNLOCK YOUR POTENTIAL
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Transform your resume into a comprehensive skill profile with AI-powered
          analysis in seconds.
        </p>

        <Button
          onClick={scrollToUpload}
          size="lg"
          className="px-12 py-6 text-lg bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-purple-400/80 active:scale-95"
        >
          Start the Simulation
        </Button>
      </div>
    </div>
  );
};
