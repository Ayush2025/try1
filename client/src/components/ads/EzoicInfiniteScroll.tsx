import { useEffect, useRef, useState, useCallback } from "react";
import { useEzoicDynamicAds } from "./EzoicDynamicAd";

interface EzoicInfiniteScrollProps {
  children: React.ReactNode;
  initialPlacementIds: number[];
  scrollPlacementIds: number[];
  reuseThreshold?: number; // Number of items before reusing placements
  className?: string;
}

interface ScrollItem {
  id: string;
  placementIds: number[];
  element: React.ReactNode;
}

export function EzoicInfiniteScroll({
  children,
  initialPlacementIds,
  scrollPlacementIds,
  reuseThreshold = 3,
  className = ""
}: EzoicInfiniteScrollProps) {
  const [scrollItems, setScrollItems] = useState<ScrollItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { showAds, destroyAds } = useEzoicDynamicAds();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Initialize first set of ads
  useEffect(() => {
    if (!hasInitialized.current && initialPlacementIds.length > 0) {
      hasInitialized.current = true;
      const timer = setTimeout(() => {
        showAds(...initialPlacementIds);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [initialPlacementIds, showAds]);

  // Handle loading new content with ads
  const loadNewContent = useCallback((newContent: React.ReactNode) => {
    const newIndex = currentIndex + 1;
    const shouldReusePlacements = newIndex >= reuseThreshold;

    let placementIds: number[];
    
    if (shouldReusePlacements) {
      // Reuse initial placements by destroying and recreating them
      placementIds = initialPlacementIds;
      
      // Destroy the old placements first
      destroyAds(...initialPlacementIds);
      
      // Small delay to ensure cleanup, then show ads again
      setTimeout(() => {
        showAds(...initialPlacementIds);
      }, 500);
    } else {
      // Use new placement IDs for scroll content
      const startIndex = (newIndex - 1) * scrollPlacementIds.length;
      placementIds = scrollPlacementIds.slice(startIndex, startIndex + scrollPlacementIds.length);
      
      if (placementIds.length > 0) {
        setTimeout(() => {
          showAds(...placementIds);
        }, 500);
      }
    }

    const newItem: ScrollItem = {
      id: `scroll-item-${newIndex}`,
      placementIds,
      element: newContent
    };

    setScrollItems(prev => [...prev, newItem]);
    setCurrentIndex(newIndex);
  }, [currentIndex, reuseThreshold, initialPlacementIds, scrollPlacementIds, destroyAds, showAds]);

  // Expose loadNewContent function to parent components
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      (container as any).loadNewContent = loadNewContent;
    }
  }, [loadNewContent]);

  return (
    <div ref={containerRef} className={className}>
      {/* Initial content with initial placement IDs */}
      <div className="initial-content">
        {children}
        {initialPlacementIds.map(id => (
          <div key={`initial-${id}`} id={`ezoic-pub-ad-placeholder-${id}`} />
        ))}
      </div>

      {/* Dynamically loaded scroll content */}
      {scrollItems.map((item, index) => (
        <div key={item.id} className="scroll-content-item">
          {item.element}
          {item.placementIds.map(id => (
            <div key={`${item.id}-${id}`} id={`ezoic-pub-ad-placeholder-${id}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Example usage component for articles with infinite scroll
export function ArticleInfiniteScroll() {
  const [scrollContainer, setScrollContainer] = useState<any>(null);

  const loadArticle = (articleIndex: number) => {
    const newArticle = (
      <article className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Article {articleIndex}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This is article content number {articleIndex}. Lorem ipsum dolor sit amet, 
          consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
          aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in 
          voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
          deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error.
        </p>
      </article>
    );

    if (scrollContainer && scrollContainer.loadNewContent) {
      scrollContainer.loadNewContent(newArticle);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <EzoicInfiniteScroll
        initialPlacementIds={[102, 103, 104]}
        scrollPlacementIds={[105, 106, 107, 108, 109, 110]}
        reuseThreshold={3}
        className="space-y-6"
      >
        <article className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-4">Initial Article</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This is the initial article content that loads with the page. It uses 
            initial placement IDs for ads.
          </p>
        </article>
      </EzoicInfiniteScroll>

      <div className="text-center mt-8">
        <button
          onClick={() => loadArticle(Date.now())}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Load Next Article
        </button>
      </div>
    </div>
  );
}