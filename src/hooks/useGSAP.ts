import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP as useGSAPBase } from '@gsap/react';
import { useMemo } from 'react';

// Register ScrollTrigger once at module level
gsap.registerPlugin(ScrollTrigger);

// Re-export the standard @gsap/react hook for components to use
export { useGSAPBase as useGSAP };

// Export ScrollTrigger for direct use in components
export { ScrollTrigger };

// Export gsap instance for direct use
export { gsap };

/**
 * Returns true if the visitor has requested reduced motion.
 * Safe to call during SSR (returns false when window is unavailable).
 */
export function useReducedMotion(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
}
