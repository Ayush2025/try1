// Google Analytics utility functions for BrainMate AI

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-PLBJLYCJVQ', {
      page_path: url
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track tutor creation events
export const trackTutorCreated = (tutorName: string, subject: string) => {
  trackEvent('tutor_created', 'engagement', `${subject}: ${tutorName}`);
};

// Track tutor interactions
export const trackTutorInteraction = (tutorId: string, action: 'view' | 'chat' | 'share') => {
  trackEvent(`tutor_${action}`, 'tutor_engagement', tutorId);
};

// Track user authentication events
export const trackAuthEvent = (action: 'login' | 'signup' | 'logout') => {
  trackEvent(action, 'authentication', action);
};

// Track subscription events
export const trackSubscriptionEvent = (action: 'upgrade' | 'downgrade' | 'cancel', plan?: string) => {
  trackEvent(action, 'subscription', plan);
};

// Track file uploads
export const trackFileUpload = (fileType: string, fileSize: number) => {
  trackEvent('file_upload', 'content', fileType, fileSize);
};