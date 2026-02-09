import { ReactNode, RefObject, FC } from "react";

export interface HorizontalScrollWrapperProps {
  /** Content to scroll horizontally */
  children: ReactNode;
  /** When true, renders children directly (no wrapper) */
  disabled?: boolean;
  /** External scrollable element ref to observe */
  scrollRef?: RefObject<HTMLElement>;
  /** Whether the track can be repositioned by dragging (default: true) */
  draggable?: boolean;
  /** Additional class for the outer wrapper */
  className?: string;
  /** Additional class for the scrollable content div */
  contentClassName?: string;
  /** Minimum thumb width in pixels (default: 40) */
  thumbMinWidth?: number;
}

declare const HorizontalScrollWrapper: FC<HorizontalScrollWrapperProps>;
export default HorizontalScrollWrapper;
