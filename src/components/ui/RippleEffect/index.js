/**
 * Ripple Effect Components and Utilities
 * 
 * This module provides everything needed to add ripple effects to your buttons
 * and clickable elements in your second-hand product selling website.
 */

// Import the main React component and hook
import RippleButton, { useRippleEffect } from './RippleButton';

// Import the CSS styles
import './RippleEffect.css';

/**
 * Utility function to add ripple effect to existing DOM elements
 * Useful for adding ripple to elements that aren't React components
 * 
 * @param {HTMLElement} element - The DOM element to add ripple to
 * @param {string} rippleColor - Optional custom ripple color
 */
export const addRippleToElement = (element, rippleColor = null) => {
  if (!element) return;

  const createRipple = (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const elementWidth = rect.width;
    const elementHeight = rect.height;
    const rippleSize = Math.sqrt(elementWidth * elementWidth + elementHeight * elementHeight) * 2;
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    if (rippleColor) {
      ripple.style.backgroundColor = rippleColor;
    }
    
    ripple.style.width = ripple.style.height = rippleSize + 'px';
    ripple.style.left = (x - rippleSize / 2) + 'px';
    ripple.style.top = (y - rippleSize / 2) + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  };

  element.classList.add('ripple-container');
  element.addEventListener('click', createRipple);

  // Return cleanup function
  return () => {
    element.classList.remove('ripple-container');
    element.removeEventListener('click', createRipple);
  };
};

/**
 * Utility function to automatically add ripple effect to all buttons with specific classes
 * Perfect for adding ripple to existing buttons without changing their HTML
 * 
 * @param {string[]} selectors - Array of CSS selectors to target
 * @param {string} rippleColor - Optional custom ripple color
 */
export const initializeRippleForSelectors = (selectors = ['.btn', 'button'], rippleColor = null) => {
  const cleanupFunctions = [];

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const cleanup = addRippleToElement(element, rippleColor);
      if (cleanup) cleanupFunctions.push(cleanup);
    });
  });

  // Return function to cleanup all ripple effects
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
};

/**
 * Predefined ripple colors for different button types
 * Use these for consistent theming across your website
 */
export const RIPPLE_COLORS = {
  // Primary actions (Buy Now, Add to Cart)
  PRIMARY: 'rgba(147, 51, 234, 0.3)',
  
  // Secondary actions (Make Offer, Contact Seller)
  SECONDARY: 'rgba(139, 92, 246, 0.2)',
  
  // Success actions (Confirm Purchase)
  SUCCESS: 'rgba(34, 197, 94, 0.3)',
  
  // Warning actions (Remove from Cart)
  WARNING: 'rgba(251, 191, 36, 0.3)',
  
  // Danger actions (Delete Item)
  DANGER: 'rgba(239, 68, 68, 0.3)',
  
  // Info actions (View Details)
  INFO: 'rgba(59, 130, 246, 0.3)',
  
  // Light theme
  LIGHT: 'rgba(0, 0, 0, 0.1)',
  
  // Dark theme
  DARK: 'rgba(255, 255, 255, 0.2)'
};

// Export the main components
export default RippleButton;
export { useRippleEffect };

/**
 * QUICK START GUIDE:
 * 
 * 1. Import the component:
 *    import RippleButton from './components/ui/RippleEffect';
 * 
 * 2. Use in your JSX:
 *    <RippleButton variant="primary" onClick={handleAddToCart}>
 *      Add to Cart
 *    </RippleButton>
 * 
 * 3. For existing buttons, add the CSS class:
 *    <button className="ripple-container btn-primary">Buy Now</button>
 * 
 * 4. Initialize for all existing buttons:
 *    import { initializeRippleForSelectors } from './components/ui/RippleEffect';
 *    initializeRippleForSelectors(['.product-card__btn', '.btn-hero-primary']);
 * 
 * CUSTOMIZATION:
 * 
 * - Change default ripple color in RippleEffect.css
 * - Use RIPPLE_COLORS constants for consistent theming
 * - Adjust animation timing in CSS keyframes
 * - Modify button styles in the CSS file
 */