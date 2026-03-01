import { useEffect, useRef, useCallback } from "react";

interface EzoicDynamicAdProps {
  placementId: number;
  className?: string;
  onDestroy?: () => void;
  autoDestroy?: boolean;
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

export function EzoicDynamicAd({ 
  placementId,
  className = "",
  onDestroy,
  autoDestroy = true
}: EzoicDynamicAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const isDestroyed = useRef(false);

  const showAd = useCallback(() => {
    // Only load ads if we have sufficient content on the page
    const contentElements = document.querySelectorAll('p, h1, h2, h3, article, main');
    const hasSubstantialContent = contentElements.length > 10;
    
    if (!hasSubstantialContent || isDestroyed.current) {
      return;
    }

    if (window.ezstandalone && window.ezstandalone.cmd && window.ezstandalone.showAds) {
      window.ezstandalone.cmd.push(() => {
        window.ezstandalone.showAds(placementId);
      });
    }
  }, [placementId]);

  const destroyAd = useCallback(() => {
    if (isDestroyed.current) return;
    
    if (window.ezstandalone && window.ezstandalone.cmd && window.ezstandalone.destroyPlaceholders) {
      window.ezstandalone.cmd.push(() => {
        window.ezstandalone.destroyPlaceholders(placementId);
      });
      isDestroyed.current = true;
      onDestroy?.();
    }
  }, [placementId, onDestroy]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Wait for Ezoic script to load then show ad
    const timer = setTimeout(showAd, 2000);

    return () => {
      clearTimeout(timer);
      if (autoDestroy) {
        destroyAd();
      }
    };
  }, [showAd, destroyAd, autoDestroy]);

  // Expose methods for manual control
  useEffect(() => {
    const element = adRef.current;
    if (element) {
      // Attach methods to DOM element for external access
      (element as any).showAd = showAd;
      (element as any).destroyAd = destroyAd;
    }
  }, [showAd, destroyAd]);

  return (
    <div 
      ref={adRef}
      id={`ezoic-pub-ad-placeholder-${placementId}`}
      className={className}
      data-placement-id={placementId}
    />
  );
}

// Hook for managing multiple dynamic ads
export function useEzoicDynamicAds() {
  const showAds = useCallback((...placementIds: number[]) => {
    const contentElements = document.querySelectorAll('p, h1, h2, h3, article, main');
    const hasSubstantialContent = contentElements.length > 10;
    
    if (!hasSubstantialContent) return;

    if (window.ezstandalone && window.ezstandalone.cmd && window.ezstandalone.showAds) {
      window.ezstandalone.cmd.push(() => {
        if (placementIds.length > 0) {
          window.ezstandalone.showAds(...placementIds);
        } else {
          // Show all ads on page if no specific IDs provided
          window.ezstandalone.showAds();
        }
      });
    }
  }, []);

  const destroyAds = useCallback((...placementIds: number[]) => {
    if (window.ezstandalone && window.ezstandalone.cmd && window.ezstandalone.destroyPlaceholders) {
      window.ezstandalone.cmd.push(() => {
        window.ezstandalone.destroyPlaceholders(...placementIds);
      });
    }
  }, []);

  const destroyAllAds = useCallback(() => {
    if (window.ezstandalone && window.ezstandalone.cmd && window.ezstandalone.destroyAll) {
      window.ezstandalone.cmd.push(() => {
        window.ezstandalone.destroyAll();
      });
    }
  }, []);

  const refreshAdsForPageChange = useCallback(() => {
    if (window.ezstandalone && window.ezstandalone.cmd && window.ezstandalone.showAds) {
      window.ezstandalone.cmd.push(() => {
        // Call showAds() without parameters to refresh all ads for new page
        window.ezstandalone.showAds();
      });
    }
  }, []);

  return {
    showAds,
    destroyAds,
    destroyAllAds,
    refreshAdsForPageChange
  };
}