import React, { useEffect, useRef } from 'react';
import './RippleEffect.css';

/**
 * RippleButton Component
 * 
 * A React wrapper component that adds ripple effect to any button or clickable element.
 * This component handles the ripple animation automatically when clicked.
 * 
 * Props:
 * - children: The button content (text, icons, etc.)
 * - className: Additional CSS classes
 * - variant: Button style variant ('primary', 'secondary', 'ghost')
 * - rippleColor: Custom ripple color (optional)
 * - disabled: Whether the button is disabled
 * - onClick: Click handler function
 * - ...rest: Any other button props (type, id, etc.)
 */
const RippleButton = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  rippleColor = null,
  disabled = false,
  onClick,
  ...rest 
}) => {
  const buttonRef = useRef(null);

  /**
   * Create ripple effect on click
   * @param {Event} event - The click event
   */
  const createRipple = (event) => {
    const button = event.currentTarget;
    
    // Don't create ripple if button is disabled
    if (disabled) return;
    
    // Get button dimensions and position
    const rect = button.getBoundingClientRect();
    
    // Calculate click position relative to the button
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate the size needed to cover the entire button
    const buttonWidth = rect.width;
    const buttonHeight = rect.height;
    const rippleSize = Math.sqrt(buttonWidth * buttonWidth + buttonHeight * buttonHeight) * 2;
    
    // Create the ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    // Apply custom ripple color if provided
    if (rippleColor) {
      ripple.style.backgroundColor = rippleColor;
    }
    
    // Position the ripple at the click point
    ripple.style.width = ripple.style.height = rippleSize + 'px';
    ripple.style.left = (x - rippleSize / 2) + 'px';
    ripple.style.top = (y - rippleSize / 2) + 'px';
    
    // Add ripple to the button
    button.appendChild(ripple);
    
    // Remove the ripple element after animation completes
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  };

  /**
   * Handle button click
   * Creates ripple effect and calls the provided onClick handler
   */
  const handleClick = (event) => {
    createRipple(event);
    
    // Call the provided onClick handler if it exists
    if (onClick && !disabled) {
      onClick(event);
    }
  };

  // Combine CSS classes
  const buttonClasses = [
    'ripple-container',
    `btn-${variant}`,
    className,
    disabled ? 'disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={buttonRef}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

/**
 * useRippleEffect Hook
 * 
 * A React hook that adds ripple effect to any existing element.
 * Useful for adding ripple to elements that aren't buttons.
 * 
 * Usage:
 * const rippleRef = useRippleEffect();
 * return <div ref={rippleRef} onClick={handleClick}>Clickable div</div>
 */
export const useRippleEffect = (rippleColor = null) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
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

    // Add ripple container class and click listener
    element.classList.add('ripple-container');
    element.addEventListener('click', createRipple);

    // Cleanup
    return () => {
      element.classList.remove('ripple-container');
      element.removeEventListener('click', createRipple);
    };
  }, [rippleColor]);

  return elementRef;
};

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic RippleButton:
 * <RippleButton onClick={() => console.log('clicked')}>
 *   Add to Cart
 * </RippleButton>
 * 
 * 2. Different variants:
 * <RippleButton variant="primary">Buy Now</RippleButton>
 * <RippleButton variant="secondary">Make an Offer</RippleButton>
 * <RippleButton variant="ghost">Contact Seller</RippleButton>
 * 
 * 3. Custom ripple color:
 * <RippleButton rippleColor="rgba(255, 0, 0, 0.3)">
 *   Delete Item
 * </RippleButton>
 * 
 * 4. With icons:
 * <RippleButton variant="primary">
 *   <ShoppingCart size={16} />
 *   Add to Cart
 * </RippleButton>
 * 
 * 5. Using the hook for custom elements:
 * const MyComponent = () => {
 *   const rippleRef = useRippleEffect();
 *   return (
 *     <div ref={rippleRef} className="custom-clickable">
 *       Click me for ripple effect
 *     </div>
 *   );
 * };
 */

export default RippleButton;