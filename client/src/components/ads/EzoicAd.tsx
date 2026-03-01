import { useEffect, useRef } from "react";

interface EzoicAdProps {
  placementId: number;
  className?: string;
}

declare global {
  interface Window {
    ezstandalone: {
      cmd: any[];
      showAds: (...placementIds: number[]) => void;
      destroyPlaceholders: (...placementIds: number[]) => void;
      destroyAll: () => void;
    };
  }
}

export function EzoicAd({ 
  placementId,
  className = ""
}: EzoicAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only load ads if we have sufficient content on the page
    const contentElements = document.querySelectorAll('p, h1, h2, h3, article, main');
    const hasSubstantialContent = contentElements.length > 10;
    
    if (!hasSubstantialContent) {
      console.log("Insufficient content for ads - Ezoic ad not loaded");
      return;
    }

    if (hasInitialized.current) return;
    hasInitialized.current = true;

    try {
      // Wait for Ezoic script to load
      const timer = setTimeout(() => {
        if (window.ezstandalone && window.ezstandalone.cmd && window.ezstandalone.showAds) {
          window.ezstandalone.cmd.push(() => {
            // Call showAds with the placement ID
            window.ezstandalone.showAds(placementId);
          });
        }
      }, 2000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Ezoic ad error:", error);
    }
  }, [placementId]);

  // Return the placeholder div as per Ezoic documentation
  // Do NOT add any styling to this div as it may cause empty white space
  return (
    <div 
      ref={adRef}
      id={`ezoic-pub-ad-placeholder-${placementId}`}
      className={className}
    />
  );
}

// Component for multiple ad placements on a single page
interface EzoicMultiAdProps {
  placementIds: number[];
  children: React.ReactNode;
}

export function EzoicMultiAd({ placementIds, children }: EzoicMultiAdProps) {
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only load ads if we have sufficient content on the page
    const contentElements = document.querySelectorAll('p, h1, h2, h3, article, main');
    const hasSubstantialContent = contentElements.length > 10;
    
    if (!hasSubstantialContent) {
      console.log("Insufficient content for ads - Ezoic ads not loaded");
      return;
    }

    if (hasInitialized.current) return;
    hasInitialized.current = true;

    try {
      // Wait for Ezoic script to load
      const timer = setTimeout(() => {
        if (window.ezstandalone && window.ezstandalone.cmd && window.ezstandalone.showAds) {
          window.ezstandalone.cmd.push(() => {
            // Call showAds with all placement IDs for better performance
            window.ezstandalone.showAds(...placementIds);
          });
        }
      }, 2000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Ezoic multi-ad error:", error);
    }
  }, [placementIds]);

  return <>{children}</>;
}