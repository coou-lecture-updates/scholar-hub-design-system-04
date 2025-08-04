
import React from "react";

/**
 * This component has been completely disabled and prevents any Lovable-related elements from appearing
 */
const LovableBadge = () => {
  // Remove any badge that might be manually added to the DOM
  React.useEffect(() => {
    const removeAllLovableElements = () => {
      // Find and remove any element with id or class containing "lovable"
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
      
      // Remove any script with src containing "lovable"
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.src && script.src.toLowerCase().includes('lovable')) {
          script.remove();
        }
      });
    };
    
    // Initial removal
    removeAllLovableElements();
    
    // Create a more aggressive MutationObserver to remove any dynamically added Lovable elements
    const observer = new MutationObserver((mutations) => {
      let foundLovableElement = false;
      
      for (let mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              const element = node as Element;
              
              // Check if element id or class contains "lovable"
              if (
                (element.id && element.id.toLowerCase().includes('lovable')) ||
                (element.className && typeof element.className === 'string' && element.className.toLowerCase().includes('lovable'))
              ) {
                element.remove();
                foundLovableElement = true;
              }
              
              // Check for data attributes
              if (element.hasAttribute && (element.hasAttribute('data-lovable') || element.hasAttribute('data-lovable-badge'))) {
                element.remove();
                foundLovableElement = true;
              }
              
              // Check for script with src containing "lovable"
              if (element.tagName === 'SCRIPT') {
                const script = element as HTMLScriptElement;
                if (script.src && script.src.toLowerCase().includes('lovable')) {
                  script.remove();
                  foundLovableElement = true;
                }
              }
            }
          });
        }
      }
      
      // If Lovable element was found and removed, do another sweep
      if (foundLovableElement) {
        removeAllLovableElements();
      }
    });
    
    // Start observing the document
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true
    });
    
    // Also add interval check every few seconds
    const interval = setInterval(removeAllLovableElements, 2000);
    
    // Cleanup function
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default LovableBadge;
