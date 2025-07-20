import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { useHover } from '../src';
import ShowDocs from './util/ShowDocs';

const Demo = () => {
  const element = (hasHovered: boolean) => <div>Hover me! {hasHovered && 'Thanks!'}</div>;
  const [hoverable, hovered] = useHover(element);

  return (
    <div>
      {hoverable}
      <div>{hovered ? 'HOVERED' : ''}</div>
    </div>
  );
};

const NestedDemo = () => {
  const [parentHoverable, parentHovered] = useHover((hovered: boolean) => (
    <div
      style={{
        padding: '20px',
        backgroundColor: hovered ? 'lightblue' : 'lightgray',
        border: '1px solid #ccc',
        margin: '10px',
      }}>
      Parent {parentHovered && '(hovered)'}
      {childHoverable}
    </div>
  ));

  const [childHoverable, childHovered] = useHover(
    (hovered: boolean) => (
      <div
        style={{
          padding: '10px',
          backgroundColor: hovered ? 'lightgreen' : 'white',
          border: '1px solid #999',
          margin: '10px',
        }}>
        Child {childHovered && '(hovered)'}
      </div>
    ),
    { stopPropagation: true } // Prevents parent hover when child is hovered
  );

  return (
    <div>
      <h3>Nested Hover with stopPropagation</h3>
      <p>
        The child element has <code>stopPropagation: true</code>, so hovering over the child won't
        trigger the parent's hover state.
      </p>
      {parentHoverable}
      <div>
        <strong>Parent hovered:</strong> {parentHovered ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Child hovered:</strong> {childHovered ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

const NestedDemoWithoutStopPropagation = () => {
  const [parentHoverable, parentHovered] = useHover((hovered: boolean) => (
    <div
      style={{
        padding: '20px',
        backgroundColor: hovered ? 'lightblue' : 'lightgray',
        border: '1px solid #ccc',
        margin: '10px',
      }}>
      Parent {parentHovered && '(hovered)'}
      {childHoverable}
    </div>
  ));

  const [childHoverable, childHovered] = useHover(
    (hovered: boolean) => (
      <div
        style={{
          padding: '10px',
          backgroundColor: hovered ? 'lightgreen' : 'white',
          border: '1px solid #999',
          margin: '10px',
        }}>
        Child {childHovered && '(hovered)'}
      </div>
    )
    // No stopPropagation - events will bubble to parent
  );

  return (
    <div>
      <h3>Nested Hover WITHOUT stopPropagation</h3>
      <p>
        Both elements will be hovered when you hover over the child, because events bubble up to the
        parent.
      </p>
      {parentHoverable}
      <div>
        <strong>Parent hovered:</strong> {parentHovered ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Child hovered:</strong> {childHovered ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

const EventAccessDemo = () => {
  const [events, setEvents] = React.useState<string[]>([]);

  const [hoverable, hovered] = useHover(
    (hovered: boolean) => (
      <div
        style={{
          padding: '20px',
          backgroundColor: hovered ? 'lightcoral' : 'lightpink',
          border: '1px solid #ccc',
          margin: '10px',
          cursor: 'pointer',
        }}>
        Hover me to see event details! {hovered && '(hovered)'}
      </div>
    ),
    {
      onMouseEnter: (event) => {
        setEvents((prev) => [
          ...prev,
          `Enter: (${event.clientX}, ${event.clientY}) at ${new Date().toLocaleTimeString()}`,
        ]);
      },
      onMouseLeave: (event) => {
        setEvents((prev) => [
          ...prev,
          `Leave: (${event.clientX}, ${event.clientY}) at ${new Date().toLocaleTimeString()}`,
        ]);
      },
    }
  );

  return (
    <div>
      <h3>Event Access Demo</h3>
      <p>This example shows how to access mouse events and coordinates:</p>
      {hoverable}
      <div>
        <strong>Hovered:</strong> {hovered ? 'Yes' : 'No'}
      </div>
      <div>
        <strong>Event Log:</strong>
        <div
          style={{
            maxHeight: '200px',
            overflow: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
            margin: '10px 0',
            backgroundColor: '#f9f9f9',
          }}>
          {events.length === 0 ? (
            <em>No events yet</em>
          ) : (
            events.map((event, index) => (
              <div key={index} style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {event}
              </div>
            ))
          )}
        </div>
        <button onClick={() => setEvents([])}>Clear Log</button>
      </div>
    </div>
  );
};

storiesOf('Sensors/useHover', module)
  .add('Docs', () => <ShowDocs md={require('../docs/useHover.md')} />)
  .add('Demo', () => <Demo />)
  .add('Nested with stopPropagation', () => <NestedDemo />)
  .add('Nested without stopPropagation', () => <NestedDemoWithoutStopPropagation />)
  .add('Event Access', () => <EventAccessDemo />);
