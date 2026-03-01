# Ezoic Integration Guide for BrainMate AI

## Overview
This guide covers the complete Ezoic integration for brainmate.online, including setup, configuration, and usage examples.

## Integration Status
✅ **Completed Steps:**
1. Header scripts integration (privacy + main script)
2. Ads.txt file setup for brainmate.online
3. React components for ad placements
4. Domain configuration updated

## How to Use Ezoic Ads

### Static Ad Placement
```tsx
import { EzoicAd } from "@/components/ads/EzoicAd";

// Use with your actual placement ID from Ezoic dashboard
<EzoicAd placementId={101} />
```

### Dynamic Ad Placement (Recommended for SPA)
```tsx
import { EzoicDynamicAd, useEzoicDynamicAds } from "@/components/ads/EzoicDynamicAd";

// Component with auto-cleanup
<EzoicDynamicAd placementId={101} autoDestroy={true} />

// Manual ad management
function MyComponent() {
  const { showAds, destroyAds, refreshAdsForPageChange } = useEzoicDynamicAds();
  
  const handleNewContent = () => {
    showAds(104, 105); // Show new ads
  };
  
  const handlePageChange = () => {
    refreshAdsForPageChange(); // Refresh all ads for new page
  };
  
  return <div>Your content</div>;
}
```

### Multiple Ads on Same Page
```tsx
import { EzoicMultiAd, EzoicAd } from "@/components/ads/EzoicAd";

<EzoicMultiAd placementIds={[101, 102, 103]}>
  <EzoicAd placementId={101} />
  <div>Your content here</div>
  <EzoicAd placementId={102} />
  <div>More content</div>
  <EzoicAd placementId={103} />
</EzoicMultiAd>
```

### Infinite Scroll Implementation
```tsx
import { EzoicInfiniteScroll } from "@/components/ads/EzoicInfiniteScroll";

<EzoicInfiniteScroll
  initialPlacementIds={[102, 103, 104]}
  scrollPlacementIds={[105, 106, 107, 108]}
  reuseThreshold={3}
>
  <div>Initial content</div>
</EzoicInfiniteScroll>
```

### Page Router Integration
```tsx
import { EzoicPageRouter } from "@/components/ads/EzoicPageRouter";

// Automatically refresh ads on route changes
<EzoicPageRouter enableAutoRefresh={true}>
  <App />
</EzoicPageRouter>
```

### Using Pre-configured Components
```tsx
import { TopBannerAd, SidebarAd, ContentAd, FooterAd } from "@/components/ads/AdManager";

function MyPage() {
  return (
    <div>
      <TopBannerAd />
      <div className="content">
        Your page content
        <ContentAd />
      </div>
      <FooterAd />
    </div>
  );
}
```

## Next Steps to Complete Setup

### 1. Create Ezoic Account
- Sign up at [Ezoic.com](https://ezoic.com)
- Add brainmate.online as your website
- Complete their site verification process

### 2. Get Placement IDs
- In your Ezoic dashboard, create ad placements
- Note the placement ID numbers (e.g., 101, 102, 103)
- Replace example IDs in components with your actual IDs

### 3. Update Ads.txt
- Get your specific ads.txt entries from Ezoic
- Replace the current ads.txt content with Ezoic's provided entries
- OR set up redirect: `https://srv.adstxtmanager.com/19390/brainmate.online`

### 4. Test Integration
- Deploy to brainmate.online
- Verify ads.txt is accessible at `brainmate.online/ads.txt`
- Check that ad placements load correctly
- Monitor Ezoic dashboard for impression data

## Current Ad Networks
1. **Monetag** - Meta tag verification integrated
2. **Google AdSense** - Full integration complete
3. **Ezoic** - Site verification complete, technical integration ready

## Dynamic Content Management

### Page Changes
When navigating between pages in a single-page application, ads need to be refreshed:
```tsx
import { useEzoicPageChange } from "@/components/ads/EzoicPageRouter";

function Navigation() {
  const { handlePageChange } = useEzoicPageChange();
  
  const navigateToPage = (path: string) => {
    // Navigate to new page
    history.pushState(null, '', path);
    // Refresh ads for new page
    handlePageChange(path);
  };
}
```

### New Content Loading
When loading new content dynamically (e.g., AJAX, infinite scroll):
```tsx
const { showAds, destroyAds } = useEzoicDynamicAds();

// Load new content with ads
const loadNewContent = () => {
  // Add new placeholders to DOM first
  showAds(104, 105); // Then show ads in new placeholders
};

// Remove content and cleanup ads
const removeContent = () => {
  destroyAds(104, 105); // Clean up ads first
  // Then remove DOM elements
};
```

### Infinite Scroll Pattern
```tsx
// Reuse placements every 3 items
const handleScroll = () => {
  if (shouldReusePlacements) {
    destroyAds(102, 103, 104); // Destroy old
    setTimeout(() => {
      showAds(102, 103, 104); // Recreate with same IDs
    }, 500);
  } else {
    showAds(105, 106); // Use new placement IDs
  }
};
```

## Important Notes
- Ezoic ads will only show with substantial page content (10+ elements)
- Never add CSS styling to Ezoic placeholder divs
- Use EzoicMultiAd for pages with multiple placements (better performance)
- Use EzoicDynamicAd for single-page applications with changing content
- Always destroy ads before removing DOM elements to prevent memory leaks
- Wait 500ms between destroy and recreate operations for placement reuse
- Placement IDs in this codebase (101-110) are examples - replace with actual IDs