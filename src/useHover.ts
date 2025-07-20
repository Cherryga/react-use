import * as React from 'react';
import { noop } from './misc/util';

const { useState } = React;

export type Element = ((state: boolean) => React.ReactElement<any>) | React.ReactElement<any>;

export interface UseHoverOptions {
  stopPropagation?: boolean;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
}

const useHover = (element: Element, options?: UseHoverOptions): [React.ReactElement<any>, boolean] => {
  const [state, setState] = useState(false);
  const { stopPropagation = false, onMouseEnter: onMouseEnterOption, onMouseLeave: onMouseLeaveOption } = options || {};

  const onMouseEnter = (originalOnMouseEnter?: any) => (event: any) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    (originalOnMouseEnter || noop)(event);
    (onMouseEnterOption || noop)(event);
    setState(true);
  };
  const onMouseLeave = (originalOnMouseLeave?: any) => (event: any) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    (originalOnMouseLeave || noop)(event);
    (onMouseLeaveOption || noop)(event);
    setState(false);
  };

  if (typeof element === 'function') {
    element = element(state);
  }

  const el = React.cloneElement(element, {
    onMouseEnter: onMouseEnter(element.props.onMouseEnter),
    onMouseLeave: onMouseLeave(element.props.onMouseLeave),
  });

  return [el, state];
};

export default useHover;
