import { useEffect } from 'react';

/**
 * Custom hook to handle automatic scrolling when keyboard appears on mobile
 * Ensures text inputs are visible above the keyboard
 */
export function useKeyboardScroll() {
  useEffect(() => {
    const handleFocus = (e) => {
      const target = e.target;

      // Only handle input and textarea elements
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Small delay to ensure keyboard is shown
        setTimeout(() => {
          // Get the input's position
          const rect = target.getBoundingClientRect();
          const viewportHeight = window.visualViewport?.height || window.innerHeight;

          // Check if input is in the lower half of visible viewport
          // or if it's below the visible area
          if (rect.bottom > viewportHeight * 0.6 || rect.top > viewportHeight) {
            // Calculate scroll offset to position input in upper third of viewport
            const scrollOffset = rect.top + window.scrollY - (viewportHeight * 0.25);

            // Smooth scroll to position
            window.scrollTo({
              top: Math.max(0, scrollOffset),
              behavior: 'smooth'
            });
          }
        }, 300); // Wait for keyboard animation
      }
    };

    // Add focus listener to all inputs
    document.addEventListener('focusin', handleFocus, true);

    // Also handle viewport resize (when keyboard shows/hides)
    const handleResize = () => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        const rect = activeElement.getBoundingClientRect();
        const viewportHeight = window.visualViewport?.height || window.innerHeight;

        // If active input is below viewport, scroll it into view
        if (rect.bottom > viewportHeight) {
          const scrollOffset = rect.top + window.scrollY - (viewportHeight * 0.25);
          window.scrollTo({
            top: Math.max(0, scrollOffset),
            behavior: 'smooth'
          });
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('focusin', handleFocus, true);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);
}
