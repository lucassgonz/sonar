import { useRouteTransition } from "@/hooks/useRouteTransition";
import { LoadingScreen } from "./LoadingScreen";

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const isTransitioning = useRouteTransition();

  return (
    <>
      {/* Loading screen with fade transition */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isTransitioning ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <LoadingScreen />
      </div>

      {/* Page content with fade transition */}
      <div
        className={`transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
};
