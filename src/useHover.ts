import * as React from 'react';
import { noop } from './misc/util';

const { useState } = React;

export type Element = ((state: boolean) => React.ReactElement<any>) | React.ReactElement<any>;

/**
 * Options for useHover hook to control event behavior
 * @see https://github.com/streamich/react-use/issues/2481
 */
export interface UseHoverOptions {
  /**
   * Prevents hover events from bubbling to parent elements.
   * Useful for nested hoverable elements.
   */
  stopPropagation?: boolean;

  /**
   * Callback when mouse enters - provides access to mouse event
   */
  onMouseEnter?: (event: React.MouseEvent) => void;

  /**
   * Callback when mouse leaves - provides access to mouse event
   */
  onMouseLeave?: (event: React.MouseEvent) => void;
}

/**
 * Enhanced useHover with event propagation control and event access.
 * Maintains full backward compatibility.
 */
const useHover = (
  element: Element,
  options?: UseHoverOptions
): [React.ReactElement<any>, boolean] => {
  const [state, setState] = useState(false);

  // Extract options with backward-compatible defaults
  const {
    stopPropagation = false,
    onMouseEnter: onMouseEnterOption,
    onMouseLeave: onMouseLeaveOption,
  } = options || {};

  /**
   * Enhanced mouse enter handler with optional stopPropagation and event access
   */
  const onMouseEnter = (originalOnMouseEnter?: any) => (event: any) => {
    // Prevent event bubbling if requested (solves nested hover issue)
    if (stopPropagation) {
      event.stopPropagation();
    }

    // Preserve original behavior
    (originalOnMouseEnter || noop)(event);

    // Call custom callback for event access
    (onMouseEnterOption || noop)(event);

    setState(true);
  };

  /**
   * Enhanced mouse leave handler - mirrors enter handler logic
   */
  const onMouseLeave = (originalOnMouseLeave?: any) => (event: any) => {
    if (stopPropagation) {
      event.stopPropagation();
    }

    (originalOnMouseLeave || noop)(event);
    (onMouseLeaveOption || noop)(event);

    setState(false);
  };

  // Handle function-based element (render prop)
  if (typeof element === 'function') {
    element = element(state);
  }

  // Clone element with enhanced hover handlers
  const el = React.cloneElement(element, {
    onMouseEnter: onMouseEnter(element.props.onMouseEnter),
    onMouseLeave: onMouseLeave(element.props.onMouseLeave),
  });

  return [el, state];
};

export default useHover;
