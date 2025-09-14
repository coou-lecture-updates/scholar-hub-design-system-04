// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const trackPageView = (title: string, path: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: title,
      page_location: window.location.href,
      page_path: path,
    });
  }
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackUserRegistration = () => {
  trackEvent('sign_up', 'authentication', 'user_registration');
};

export const trackUserLogin = () => {
  trackEvent('login', 'authentication', 'user_login');
};

export const trackEventRegistration = (eventName: string) => {
  trackEvent('event_registration', 'events', eventName);
};

export const trackPaymentSuccess = (amount: number, currency: string = 'NGN') => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: Date.now().toString(),
      value: amount,
      currency: currency,
      event_category: 'payment',
    });
  }
};

export const trackSearchQuery = (query: string) => {
  trackEvent('search', 'engagement', query);
};

export const trackDownload = (fileName: string) => {
  trackEvent('file_download', 'engagement', fileName);
};