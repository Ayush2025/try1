import { useEffect } from "react";
import { useLocation } from "wouter";
import { useEzoicDynamicAds } from "./EzoicDynamicAd";

interface EzoicPageRouterProps {
  children: React.ReactNode;
  enableAutoRefresh?: boolean;
}

// Component that automatically refreshes ads when routes change
export function EzoicPageRouter({ 
  children, 
  enableAutoRefresh = true 
}: EzoicPageRouterProps) {
  const [location] = useLocation();
  const { refreshAdsForPageChange } = useEzoicDynamicAds();

  useEffect(() => {
    if (enableAutoRefresh) {
      // Small delay to ensure new page content has loaded
      const timer = setTimeout(() => {
        refreshAdsForPageChange();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [location, enableAutoRefresh, refreshAdsForPageChange]);

  return <>{children}</>;
}

// Hook for manual page change ad management
export function useEzoicPageChange() {
  const { refreshAdsForPageChange, destroyAllAds } = useEzoicDynamicAds();

  const handlePageChange = (newPath?: string) => {
    // Refresh ads for the new page
    refreshAdsForPageChange();
  };

  const cleanupAllAds = () => {
    // Remove all ads before navigating away
    destroyAllAds();
  };

  return {
    handlePageChange,
    cleanupAllAds
  };
}