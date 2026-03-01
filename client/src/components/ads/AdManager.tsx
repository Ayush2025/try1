import { EzoicAd, EzoicMultiAd } from "./EzoicAd";
import { EzoicDynamicAd } from "./EzoicDynamicAd";
import { AdSenseAd } from "./AdSenseAd";

interface AdManagerProps {
  type: "ezoic" | "ezoic-dynamic" | "adsense";
  placementId?: number;
  adSlot?: string;
  className?: string;
  autoDestroy?: boolean;
  onDestroy?: () => void;
}

// Centralized ad management component
export function AdManager({ 
  type, 
  placementId, 
  adSlot, 
  className, 
  autoDestroy,
  onDestroy 
}: AdManagerProps) {
  if (type === "ezoic" && placementId) {
    return <EzoicAd placementId={placementId} className={className} />;
  }
  
  if (type === "ezoic-dynamic" && placementId) {
    return (
      <EzoicDynamicAd 
        placementId={placementId} 
        className={className}
        autoDestroy={autoDestroy}
        onDestroy={onDestroy}
      />
    );
  }
  
  if (type === "adsense" && adSlot) {
    return <AdSenseAd adSlot={adSlot} className={className} />;
  }

  return null;
}

// Pre-configured common ad placements
export function TopBannerAd() {
  return (
    <div className="w-full max-w-4xl mx-auto my-4">
      <AdManager type="ezoic" placementId={101} className="text-center" />
    </div>
  );
}

export function SidebarAd() {
  return (
    <div className="w-full max-w-xs my-4">
      <AdManager type="ezoic" placementId={102} />
    </div>
  );
}

export function ContentAd() {
  return (
    <div className="w-full max-w-2xl mx-auto my-6">
      <AdManager type="ezoic" placementId={103} />
    </div>
  );
}

export function FooterAd() {
  return (
    <div className="w-full max-w-4xl mx-auto my-4">
      <AdManager type="ezoic" placementId={104} />
    </div>
  );
}

// Example of using multiple ads on a single page
export function ArticlePage({ children }: { children: React.ReactNode }) {
  const placementIds = [101, 102, 103, 104];
  
  return (
    <EzoicMultiAd placementIds={placementIds}>
      <div className="article-container">
        <TopBannerAd />
        
        <div className="flex gap-8">
          <div className="flex-1">
            {children}
            <ContentAd />
          </div>
          
          <aside className="w-80">
            <SidebarAd />
          </aside>
        </div>
        
        <FooterAd />
      </div>
    </EzoicMultiAd>
  );
}