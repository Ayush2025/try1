import { useEffect } from "react";

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSenseAd({ 
  adSlot, 
  adFormat = "auto", 
  fullWidthResponsive = true,
  style = { display: "block" },
  className = ""
}: AdSenseAdProps) {
  useEffect(() => {
    // Only load ads if we have sufficient content on the page
    const contentElements = document.querySelectorAll('p, h1, h2, h3, article, main');
    const hasSubstantialContent = contentElements.length > 10;
    
    if (!hasSubstantialContent) {
      console.log("Insufficient content for ads - AdSense ad not loaded");
      return;
    }

    try {
      // Small delay to ensure page content is fully loaded and avoid duplicate ads
      const timer = setTimeout(() => {
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      }, 2000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  // Temporarily disable ads to comply with AdSense policies
  // Only show placeholder content until policy violations are resolved
  return (
    <div className={`adsense-container ${className} hidden`}>
      <div className="text-center text-muted-foreground p-4">
        <p className="text-sm">Advertisement space - Compliant with AdSense policies</p>
      </div>
    </div>
  );
}