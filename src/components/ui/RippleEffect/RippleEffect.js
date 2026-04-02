/**
 * RIPPLE EFFECT JAVASCRIPT
 * 
 * This script creates a ripple effect on buttons when clicked.
 * The ripple starts from the exact point where the user clicked
 * and expands outward with a smooth animation.
 */

class RippleEffect {
  constructor() {
    this.init();
  }

  /**
   * Initialize the ripple effect
   * Automatically finds all buttons with 'ripple-container' class
   * and adds click event listeners to them
   */
  init() {
    // Find all elements that should have ripple effect
    const rippleContainers = document.querySelectorAll('.ripple-container');
    
    // Add click event listener to each container
    rippleContainers.forEach(container => {
      container.addEventListener('click', (e) => this.createRipple(e));
    });

    // Also watch for dynamically added buttons
    this.observeNewButtons();
  }

  /**
   * Create and animate the ripple effect
   * @param {Event} event - The click event containing mouse position
   */
  createRipple(event) {
    const button = event.currentTarget;
    
    // Get button dimensions and position
    const rect = button.getBoundingClientRect();
    
    // Calculate click position relative to the button
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate the size needed to cover the entire button
    // We use the diagonal distance to ensure full coverage
    const buttonWidth = rect.width;
    const buttonHeight = rect.height;
    const rippleSize = Math.sqrt(buttonWidth * buttonWidth + buttonHeight * buttonHeight) * 2;
    
    // Create the ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    // Position the ripple at the click point
    // Subtract half the size to center the circle on the click point
    ripple.style.width = ripple.style.height = rippleSize + 'px';
    ripple.style.left = (x - rippleSize / 2) + 'px';
    ripple.style.top = (y - rippleSize / 2) + 'px';
    
    // Add ripple to the button
    button.appendChild(ripple);
    
    // Remove the ripple element after animation completes
    // This prevents memory leaks from accumulating ripple elements
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600); // Match the animation duration in CSS
  }

  /**
   * Watch for dynamically added buttons and add ripple effect to them
   * This is useful for buttons added via JavaScript after page load
   */
  observeNewButtons() {
    // Create a MutationObserver to watch for new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is an element
          if (node.nodeType === 1) {
            // Check if it's a ripple container or contains ripple containers
            if (node.classList && node.classList.contains('ripple-container')) {
              node.addEventListener('click', (e) => this.createRipple(e));
            }
            
            // Also check child elements
            const childContainers = node.querySelectorAll && node.querySelectorAll('.ripple-container');
            if (childContainers) {
              childContainers.forEach(container => {
                container.addEventListener('click', (e) => this.createRipple(e));
              });
            }
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Manually add ripple effect to a specific element
   * Useful for programmatically adding the effect
   * @param {HTMLElement} element - The element to add ripple effect to
   */
  addToElement(element) {
    if (!element.classList.contains('ripple-container')) {
      element.classList.add('ripple-container');
    }
    element.addEventListener('click', (e) => this.createRipple(e));
  }

  /**
   * Remove ripple effect from a specific element
   * @param {HTMLElement} element - The element to remove ripple effect from
   */
  removeFromElement(element) {
    element.classList.remove('ripple-container');
    // Note: We don't remove the event listener as it's bound to the class check
  }

  /**
   * Customize ripple color for specific elements
   * @param {HTMLElement} element - The element to customize
   * @param {string} color - The ripple color (e.g., 'rgba(255, 0, 0, 0.3)')
   */
  setCustomColor(element, color) {
    // Create a unique class name for this element
    const uniqueClass = 'ripple-custom-' + Math.random().toString(36).substr(2, 9);
    element.classList.add(uniqueClass);
    
    // Create and inject custom CSS
    const style = document.createElement('style');
    style.textContent = `
      .${uniqueClass} .ripple {
        background-color: ${color} !important;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Add the 'ripple-container' class to any button you want to have the ripple effect
 * 2. Include this JavaScript file in your HTML
 * 3. The ripple effect will automatically work on all buttons with the class
 * 
 * EXAMPLES:
 * 
 * HTML:
 * <button class="ripple-container btn-primary">Add to Cart</button>
 * <button class="ripple-container btn-secondary">Make an Offer</button>
 * <button class="ripple-container btn-ghost">Contact Seller</button>
 * 
 * JavaScript (for dynamic buttons):
 * const rippleEffect = new RippleEffect();
 * rippleEffect.addToElement(myButton);
 * 
 * CUSTOMIZATION:
 * 
 * - Change ripple color: Modify the background-color in the CSS .ripple class
 * - Change animation speed: Modify the animation-duration in CSS and setTimeout in JS
 * - Change ripple size: Modify the scale values in the CSS keyframes
 * - Add custom colors: Use rippleEffect.setCustomColor(element, 'rgba(255, 0, 0, 0.3)')
 */

// Initialize the ripple effect when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.rippleEffect = new RippleEffect();
});

// Also initialize if the script is loaded after DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.rippleEffect = new RippleEffect();
  });
} else {
  window.rippleEffect = new RippleEffect();
}