
import { useState, useEffect } from 'react';

export function useLovableBadge() {
  // Always set enabled to false
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    // Ensure badge is disabled and save to localStorage
    localStorage.setItem('lovable-badge-enabled', 'false');
    
    // Remove any badge element that might be added directly to the DOM
    const removeBadgeElements = () => {
      const selectors = [
        "#lovable-badge",
        ".lovable-badge",
        "[data-lovable-badge]",
        "[data-lovable]",
        "#__lovable_debug",
        "#__lovable_status",
        "[id*='lovable']",
        "[class*='lovable']"
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });
      
      // Also remove any script with src containing "lovable"
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.src && script.src.toLowerCase().includes('lovable')) {
          script.remove();
        }
      });
    };
    
    // Initial removal
    removeBadgeElements();
    
    // Add event listener to catch any attempt to add the badge
    const observer = new MutationObserver((mutations) => {
      let badgeAdded = false;
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i] as HTMLElement;
            if (
              (node.id && node.id.toLowerCase().includes('lovable')) ||
              (node.className && typeof node.className === 'string' && node.className.toLowerCase().includes('lovable'))
            ) {
              node.remove();
              badgeAdded = true;
            }
            
            // If it's a script with src containing "lovable"
            if (node.tagName === 'SCRIPT') {
              const script = node as HTMLScriptElement;
              if (script.src && script.src.toLowerCase().includes('lovable')) {
                script.remove();
                badgeAdded = true;
              }
            }
          }
        }
      });
      
      // If a badge was added and removed, do a full sweep
      if (badgeAdded) {
        removeBadgeElements();
      }
    });
    
    // Start observing the document with configured parameters
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true
    });
    
    // Also add interval check every few seconds
    const interval = setInterval(removeBadgeElements, 2000);
    
    // Cleanup function to disconnect observer when component unmounts
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);
  
  // Always return false for enabled and a no-op for setEnabled
  return { 
    enabled: false, 
    setEnabled: () => {} 
  };
}
