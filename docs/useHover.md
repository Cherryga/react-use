# `useHover` and `useHoverDirty`

React UI sensor hooks that track if some element is being hovered
by a mouse.

- `useHover` accepts a React element or a function that returns one,
`useHoverDirty` accepts React ref.
- `useHover` sets react `onMouseEnter` and `onMouseLeave` events,
`useHoverDirty` sets DOM `onmouseover` and `onmouseout` events.


## Usage

```jsx
import {useHover} from 'react-use';

const Demo = () => {
  const element = (hovered) =>
    <div>
      Hover me! {hovered && 'Thanks!'}
    </div>;
  const [hoverable, hovered] = useHover(element);

  return (
    <div>
      {hoverable}
      <div>{hovered ? 'HOVERED' : ''}</div>
    </div>
  );
};
```

### With stopPropagation

For nested hoverable elements where you want to prevent event bubbling:

```jsx
import {useHover} from 'react-use';

const Demo = () => {
  const [parentHoverable, parentHovered] = useHover(
    (hovered) => (
      <div style={{ padding: '20px', backgroundColor: hovered ? 'lightblue' : 'lightgray' }}>
        Parent {parentHovered && '(hovered)'}
        {childHoverable}
      </div>
    )
  );

  const [childHoverable, childHovered] = useHover(
    (hovered) => (
      <div style={{ padding: '10px', backgroundColor: hovered ? 'lightgreen' : 'white' }}>
        Child {childHovered && '(hovered)'}
      </div>
    ),
    { stopPropagation: true } // Prevents parent hover when child is hovered
  );

  return (
    <div>
      {parentHoverable}
      <div>Parent hovered: {parentHovered ? 'Yes' : 'No'}</div>
      <div>Child hovered: {childHovered ? 'Yes' : 'No'}</div>
    </div>
  );
};
```

### With event access

You can also access the mouse events for custom handling:

```jsx
import {useHover} from 'react-use';

const Demo = () => {
  const [hoverable, hovered] = useHover(
    (hovered) => <div>Hover me! {hovered && 'Thanks!'}</div>,
    {
      onMouseEnter: (event) => {
        console.log('Mouse entered at:', event.clientX, event.clientY);
      },
      onMouseLeave: (event) => {
        console.log('Mouse left at:', event.clientX, event.clientY);
      }
    }
  );

  return hoverable;
};
```

## Reference

```js
const [newReactElement, isHovering] = useHover(reactElement);
const [newReactElement, isHovering] = useHover(reactElement, options);
const [newReactElement, isHovering] = useHover((isHovering) => reactElement);
const [newReactElement, isHovering] = useHover((isHovering) => reactElement, options);
const isHovering = useHoverDirty(ref);
```

### Options

- `stopPropagation: boolean` — if `true`, calls `event.stopPropagation()` on mouse enter/leave events to prevent event bubbling
- `onMouseEnter: (event: React.MouseEvent) => void` — callback fired when mouse enters the element
- `onMouseLeave: (event: React.MouseEvent) => void` — callback fired when mouse leaves the element
