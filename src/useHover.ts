import * as React from 'react';
import { noop } from './misc/util';

const { useState } = React;

export type Element = ((state: boolean) => React.ReactElement<any>) | React.ReactElement<any>;

/**
 * Configuration options for the useHover hook
 * 
 * This interface was added to solve the common problem of nested hoverable elements
 * where hovering over a child element would also trigger the parent's hover state
 * due to event bubbling.
 * 
 * @see https://github.com/streamich/react-use/issues/2481
 */
export interface UseHoverOptions {
  /**
   * If true, prevents the hover event from bubbling up to parent elements.
   * 
   * Use this when you have nested hoverable elements and you want to prevent
   * the parent from being hovered when the child is hovered.
   * 
   * Example:
   * ```jsx
   * // Child won't trigger parent hover
   * const [child] = useHover(element, { stopPropagation: true });
   * ```
   */
  stopPropagation?: boolean;
  
  /**
   * Callback fired when mouse enters the element.
   * Provides access to the original mouse event for custom handling.
   * 
   * Example:
   * ```jsx
   * const [hoverable] = useHover(element, {
   *   onMouseEnter: (event) => console.log('Mouse at:', event.clientX, event.clientY)
   * });
   * ```
   */
  onMouseEnter?: (event: React.MouseEvent) => void;
  
  /**
   * Callback fired when mouse leaves the element.
   * Provides access to the original mouse event for custom handling.
   */
  onMouseLeave?: (event: React.MouseEvent) => void;
}

/**
 * Enhanced useHover hook with event propagation control and event access
 * 
 * This hook tracks hover state while providing options to control event behavior.
 * It maintains full backward compatibility - existing code continues to work unchanged.
 * 
 * @param element - React element or function that returns an element
 * @param options - Optional configuration for hover behavior
 * @returns [enhancedElement, isHovered] - The element with hover handlers and hover state
 */
const useHover = (element: Element, options?: UseHoverOptions): [React.ReactElement<any>, boolean] => {
  const [state, setState] = useState(false);
  
  // Extract options with sensible defaults
  // stopPropagation defaults to false to maintain backward compatibility
  const { stopPropagation = false, onMouseEnter: onMouseEnterOption, onMouseLeave: onMouseLeaveOption } = options || {};

  /**
   * Enhanced mouse enter handler
   * 
   * This function wraps the original onMouseEnter behavior and adds:
   * 1. Optional stopPropagation to prevent event bubbling
   * 2. Optional custom callback for event access
   * 3. Original behavior preservation for backward compatibility
   */
  const onMouseEnter = (originalOnMouseEnter?: any) => (event: any) => {
    // Prevent event from bubbling to parent elements if requested
    // This solves the nested hover elements problem
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    // Always call the original onMouseEnter if it exists
    // This ensures existing functionality continues to work
    (originalOnMouseEnter || noop)(event);
    
    // Call the custom callback if provided
    // This gives developers access to the mouse event for custom logic
    (onMouseEnterOption || noop)(event);
    
    // Update hover state
    setState(true);
  };

  /**
   * Enhanced mouse leave handler
   * 
   * Mirrors the enter handler logic for consistency
   */
  const onMouseLeave = (originalOnMouseLeave?: any) => (event: any) => {
    // Prevent event bubbling if requested
    if (stopPropagation) {
      event.stopPropagation();
    }
    
    // Preserve original behavior
    (originalOnMouseLeave || noop)(event);
    
    // Call custom callback
    (onMouseLeaveOption || noop)(event);
    
    // Update hover state
    setState(false);
  };

  // Handle function-based element (render prop pattern)
  if (typeof element === 'function') {
    element = element(state);
  }

  // Clone the element and attach our enhanced event handlers
  // This preserves all original props while adding hover functionality
  const el = React.cloneElement(element, {
    onMouseEnter: onMouseEnter(element.props.onMouseEnter),
    onMouseLeave: onMouseLeave(element.props.onMouseLeave),
  });

  return [el, state];
};

export default useHover;
