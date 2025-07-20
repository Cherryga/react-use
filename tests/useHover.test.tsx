import React from 'react';
import ReactDOM from 'react-dom';
import { renderHook } from '@testing-library/react-hooks';
import TestUtils from 'react-dom/test-utils';
import useHover from '../src/useHover';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null!;
});

describe('useHover', () => {
  describe('Basic functionality (backward compatibility)', () => {
    it('should init with hovered false', () => {
      const { result } = renderHook(() => useHover(<div>test</div>));
      const [, hovered] = result.current;

      expect(hovered).toBe(false);
    });

    it('should return a cloned element with hover handlers', () => {
      const { result } = renderHook(() => useHover(<div>test</div>));
      const [element] = result.current;

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.onMouseEnter).toBeDefined();
      expect(element.props.onMouseLeave).toBeDefined();
    });

    it('should work with function-based elements', () => {
      const { result } = renderHook(() => 
        useHover((hovered) => <div>{hovered ? 'hovered' : 'not hovered'}</div>)
      );
      const [element] = result.current;

      expect(React.isValidElement(element)).toBe(true);
      expect(element.props.children).toBe('not hovered');
    });

    it('should preserve existing onMouseEnter and onMouseLeave handlers', () => {
      const mockEnter = jest.fn();
      const mockLeave = jest.fn();
      
      const { result } = renderHook(() => 
        useHover(<div onMouseEnter={mockEnter} onMouseLeave={mockLeave}>test</div>)
      );
      const [element] = result.current;

      const mockEvent = { stopPropagation: jest.fn() };
      
      // Trigger mouse enter
      element.props.onMouseEnter(mockEvent);
      expect(mockEnter).toHaveBeenCalledWith(mockEvent);

      // Trigger mouse leave  
      element.props.onMouseLeave(mockEvent);
      expect(mockLeave).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Hover state changes', () => {
    it('should update hovered state on mouse enter/leave', () => {
      const { result } = renderHook(() => useHover(<div>test</div>));
      
      // Initially not hovered
      expect(result.current[1]).toBe(false);

      const mockEvent = { stopPropagation: jest.fn() };

      // Mouse enter should set hovered to true
      TestUtils.act(() => {
        result.current[0].props.onMouseEnter(mockEvent);
      });
      expect(result.current[1]).toBe(true);

      // Mouse leave should set hovered to false
      TestUtils.act(() => {
        result.current[0].props.onMouseLeave(mockEvent);
      });
      expect(result.current[1]).toBe(false);
    });

    it('should update function-based element content when hovered', () => {
      const { result } = renderHook(() => 
        useHover((hovered) => <div>{hovered ? 'hovered' : 'not hovered'}</div>)
      );
      
      // Initially shows 'not hovered'
      expect(result.current[0].props.children).toBe('not hovered');

      const mockEvent = { stopPropagation: jest.fn() };

      // After mouse enter, should show 'hovered'
      TestUtils.act(() => {
        result.current[0].props.onMouseEnter(mockEvent);
      });
      expect(result.current[0].props.children).toBe('hovered');
    });
  });

  describe('stopPropagation option', () => {
    it('should call stopPropagation when option is true', () => {
      const { result } = renderHook(() => 
        useHover(<div>test</div>, { stopPropagation: true })
      );
      const [element] = result.current;

      const mockEvent = { stopPropagation: jest.fn() };

      // Mouse enter should call stopPropagation
      element.props.onMouseEnter(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      // Mouse leave should call stopPropagation
      element.props.onMouseLeave(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(2);
    });

    it('should NOT call stopPropagation when option is false', () => {
      const { result } = renderHook(() => 
        useHover(<div>test</div>, { stopPropagation: false })
      );
      const [element] = result.current;

      const mockEvent = { stopPropagation: jest.fn() };

      element.props.onMouseEnter(mockEvent);
      element.props.onMouseLeave(mockEvent);
      
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('should NOT call stopPropagation when option is not provided', () => {
      const { result } = renderHook(() => useHover(<div>test</div>));
      const [element] = result.current;

      const mockEvent = { stopPropagation: jest.fn() };

      element.props.onMouseEnter(mockEvent);
      element.props.onMouseLeave(mockEvent);
      
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('Event callback access', () => {
    it('should call onMouseEnter callback with event', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => 
        useHover(<div>test</div>, { onMouseEnter: mockCallback })
      );
      const [element] = result.current;

      const mockEvent = { stopPropagation: jest.fn(), clientX: 100, clientY: 200 };

      element.props.onMouseEnter(mockEvent);
      
      expect(mockCallback).toHaveBeenCalledWith(mockEvent);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should call onMouseLeave callback with event', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => 
        useHover(<div>test</div>, { onMouseLeave: mockCallback })
      );
      const [element] = result.current;

      const mockEvent = { stopPropagation: jest.fn(), clientX: 150, clientY: 250 };

      element.props.onMouseLeave(mockEvent);
      
      expect(mockCallback).toHaveBeenCalledWith(mockEvent);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should work with both event callbacks', () => {
      const mockEnterCallback = jest.fn();
      const mockLeaveCallback = jest.fn();
      const { result } = renderHook(() => 
        useHover(<div>test</div>, { 
          onMouseEnter: mockEnterCallback,
          onMouseLeave: mockLeaveCallback 
        })
      );
      const [element] = result.current;

      const mockEvent = { stopPropagation: jest.fn() };

      element.props.onMouseEnter(mockEvent);
      expect(mockEnterCallback).toHaveBeenCalledWith(mockEvent);
      expect(mockLeaveCallback).not.toHaveBeenCalled();

      element.props.onMouseLeave(mockEvent);
      expect(mockLeaveCallback).toHaveBeenCalledWith(mockEvent);
      expect(mockEnterCallback).toHaveBeenCalledTimes(1);
      expect(mockLeaveCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Combined options', () => {
    it('should work with both stopPropagation and event callbacks', () => {
      const mockEnterCallback = jest.fn();
      const mockLeaveCallback = jest.fn();
      const { result } = renderHook(() => 
        useHover(<div>test</div>, { 
          stopPropagation: true,
          onMouseEnter: mockEnterCallback,
          onMouseLeave: mockLeaveCallback 
        })
      );
      const [element] = result.current;

      const mockEvent = { stopPropagation: jest.fn() };

      element.props.onMouseEnter(mockEvent);
      
      // Should call stopPropagation AND the callback
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockEnterCallback).toHaveBeenCalledWith(mockEvent);

      element.props.onMouseLeave(mockEvent);
      
      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(2);
      expect(mockLeaveCallback).toHaveBeenCalledWith(mockEvent);
    });

    it('should preserve original handlers when using all options', () => {
      const originalEnter = jest.fn();
      const originalLeave = jest.fn();
      const callbackEnter = jest.fn();
      const callbackLeave = jest.fn();

      const { result } = renderHook(() => 
        useHover(
          <div onMouseEnter={originalEnter} onMouseLeave={originalLeave}>test</div>, 
          { 
            stopPropagation: true,
            onMouseEnter: callbackEnter,
            onMouseLeave: callbackLeave 
          }
        )
      );
      const [element] = result.current;

      const mockEvent = { stopPropagation: jest.fn() };

      element.props.onMouseEnter(mockEvent);
      
      // All should be called: stopPropagation, original handler, and callback
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(originalEnter).toHaveBeenCalledWith(mockEvent);
      expect(callbackEnter).toHaveBeenCalledWith(mockEvent);

      element.props.onMouseLeave(mockEvent);
      
      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(2);
      expect(originalLeave).toHaveBeenCalledWith(mockEvent);
      expect(callbackLeave).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined options gracefully', () => {
      const { result } = renderHook(() => useHover(<div>test</div>, undefined));
      const [element, hovered] = result.current;

      expect(React.isValidElement(element)).toBe(true);
      expect(hovered).toBe(false);
    });

    it('should handle empty options object', () => {
      const { result } = renderHook(() => useHover(<div>test</div>, {}));
      const [element, hovered] = result.current;

      const mockEvent = { stopPropagation: jest.fn() };
      
      element.props.onMouseEnter(mockEvent);
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
      expect(hovered).toBe(false); // Should be true after rerender
    });

    it('should handle elements without existing mouse handlers', () => {
      const { result } = renderHook(() => 
        useHover(<div>test</div>, { stopPropagation: true })
      );
      const [element] = result.current;

      const mockEvent = { stopPropagation: jest.fn() };

      // Should not throw error even without original handlers
      expect(() => {
        element.props.onMouseEnter(mockEvent);
        element.props.onMouseLeave(mockEvent);
      }).not.toThrow();

      expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(2);
    });
  });
});