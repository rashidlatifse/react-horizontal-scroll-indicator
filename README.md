# react-horizontal-scroll-indicator

Jira-style custom draggable horizontal scrollbar indicator for React.

Replaces the native scrollbar with a compact, repositionable track + thumb that floats over your content. Supports drag-to-scroll, click-to-jump, touch, auto-detect overflow, and external scroll refs for complex layouts.

## Installation

```bash
npm install react-horizontal-scroll-indicator react-draggable
```

## CSS Import

```js
import "react-horizontal-scroll-indicator/style.css";
```

## Quick Start

```jsx
import HorizontalScrollWrapper from "react-horizontal-scroll-indicator";
import "react-horizontal-scroll-indicator/style.css";

function App() {
  return (
    <HorizontalScrollWrapper>
      <table style={{ minWidth: 2000 }}>
        {/* wide content */}
      </table>
    </HorizontalScrollWrapper>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Content to scroll horizontally |
| `disabled` | `boolean` | `false` | When `true`, renders children directly (no wrapper) |
| `scrollRef` | `RefObject<HTMLElement>` | — | External scrollable element ref to observe |
| `draggable` | `boolean` | `true` | Whether the track can be repositioned by dragging |
| `className` | `string` | `""` | Additional class for the outer wrapper |
| `contentClassName` | `string` | `""` | Additional class for the scrollable content div |
| `thumbMinWidth` | `number` | `40` | Minimum thumb width in pixels |

## Two Modes

### Mode 1: Self-managed scroll (default)

Wraps children in a scrollable div with hidden native scrollbar.

```jsx
<HorizontalScrollWrapper>
  <table style={{ minWidth: 3000 }}>...</table>
</HorizontalScrollWrapper>
```

### Mode 2: External scroll ref

Observes and controls an external scrollable element. Children render directly — your layout (sticky columns, split-scroll sync, etc.) stays intact.

```jsx
const bodyRef = useRef(null);

<HorizontalScrollWrapper scrollRef={bodyRef}>
  <div>
    <div ref={headerRef} style={{ overflowX: "auto" }}>header...</div>
    <div ref={bodyRef} style={{ overflow: "auto" }}>body...</div>
  </div>
</HorizontalScrollWrapper>
```

## CSS Customization

Override these classes to theme the scrollbar:

```css
/* Track container */
.hsw-track {
  background-color: #f8f9fb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  height: 50px;
  width: 120px;
}

/* Thumb */
.hsw-thumb {
  border: 2px solid #0e1a77;
  border-radius: 4px;
}

/* Thumb during drag */
.hsw-thumb--dragging {
  border-color: #3b82f6;
}
```

## Features

- Drag thumb to scroll content
- Click track to jump to position (smooth scroll)
- Drag track to reposition it anywhere (disable with `draggable={false}`)
- Touch support (mobile drag)
- Auto-detect horizontal overflow (hides when content fits)
- ResizeObserver for dynamic content changes
- Auto-drop on mouse leave
- External scroll ref for complex layouts

## Browser Support

Chrome, Firefox, Safari, Edge (all modern versions).

## License

MIT
