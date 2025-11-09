import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const useRouteTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Start transition
    setIsTransitioning(true);

    // Minimum display time for loading screen (prevents flash)
    const minDisplayTime = 300;
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return isTransitioning;
};
