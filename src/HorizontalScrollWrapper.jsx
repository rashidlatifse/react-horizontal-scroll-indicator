import React, { useRef, useState, useCallback, useEffect } from "react";
import Draggable from "react-draggable";
import "./HorizontalScrollWrapper.css";

const THUMB_MIN_WIDTH_DEFAULT = 40;
const OVERFLOW_TOLERANCE = 4;
const TRACK_PADDING = 8; // Must match .hsw-track padding

/**
 * Reusable wrapper that provides horizontal scrolling with a custom
 * draggable scrollbar indicator (Jira-style).
 *
 * Hides the native scrollbar and renders a custom track + thumb at the bottom.
 * The thumb can be dragged, the track can be clicked, and mousewheel/trackpad
 * scrolling updates the thumb position automatically.
 *
 * Two modes:
 * 1. **Self-managed scroll** (default): Wraps children in a scrollable div.
 * 2. **External scroll** (`scrollRef` provided): Observes and controls an
 *    external scrollable element. Children render directly — the original
 *    layout (sticky columns, split-scroll sync, etc.) stays intact.
 */
const HorizontalScrollWrapper = ({
  children,
  disabled = false,
  scrollRef,
  draggable = true,
  className = "",
  contentClassName = "",
  thumbMinWidth = THUMB_MIN_WIDTH_DEFAULT,
}) => {
  const internalContentRef = useRef(null);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartLeft = useRef(0);
  const rafId = useRef(null);
  const trackWasDragged = useRef(false);

  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [isThumbDragging, setIsThumbDragging] = useState(false);

  // Resolve the actual scroll element: external ref or internal ref
  const getScrollEl = useCallback(
    () => scrollRef?.current || internalContentRef.current,
    [scrollRef]
  );

  // ── Thumb position calculation ──────────────────────────
  const updateThumbPosition = useCallback(() => {
    const el = getScrollEl();
    const track = trackRef.current;
    if (!el || !track) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const usableWidth = track.clientWidth - TRACK_PADDING * 2;
    const maxScrollLeft = scrollWidth - clientWidth;

    if (maxScrollLeft <= 0) {
      setThumbLeft(0);
      return;
    }

    const scrollRatio = scrollLeft / maxScrollLeft;
    const maxThumbLeft = usableWidth - thumbWidth;
    setThumbLeft(scrollRatio * maxThumbLeft);
  }, [thumbWidth, getScrollEl]);

  // ── Overflow detection + thumb sizing ───────────────────
  const updateScrollbarDimensions = useCallback(() => {
    const el = getScrollEl();
    const track = trackRef.current;
    if (!el) return;

    const { clientWidth, scrollWidth } = el;
    const hasOverflow = scrollWidth > clientWidth + OVERFLOW_TOLERANCE;
    setShowScrollbar(hasOverflow);

    if (hasOverflow && track) {
      const usableWidth = track.clientWidth - TRACK_PADDING * 2;
      const ratio = clientWidth / scrollWidth;
      const newThumbWidth = Math.max(ratio * usableWidth, thumbMinWidth);
      setThumbWidth(newThumbWidth);
    }
  }, [thumbMinWidth, getScrollEl]);

  // ── ResizeObserver for content size changes ─────────────
  useEffect(() => {
    const el = getScrollEl();
    if (!el || disabled) return;

    const handleResize = () => {
      updateScrollbarDimensions();
      updateThumbPosition();
    };

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(el);
      // Also observe the first child (table) for content size changes
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    } else {
      window.addEventListener("resize", handleResize);
    }

    // Initial calculation
    handleResize();

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [disabled, updateScrollbarDimensions, updateThumbPosition, getScrollEl]);

  // ── Scroll listener (mousewheel / trackpad) ─────────────
  useEffect(() => {
    const el = getScrollEl();
    if (!el || disabled) return;

    const handleContentScroll = () => {
      if (!isDragging.current) {
        updateThumbPosition();
      }
    };

    el.addEventListener("scroll", handleContentScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleContentScroll);
  }, [disabled, updateThumbPosition, getScrollEl]);

  // ── Thumb drag (mouse) ──────────────────────────────────
  const handleThumbMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging.current = true;
      setIsThumbDragging(true);
      dragStartX.current = e.clientX;
      scrollStartLeft.current = getScrollEl()?.scrollLeft || 0;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    },
    [getScrollEl]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging.current) return;

      const el = getScrollEl();
      const track = trackRef.current;
      if (!el || !track) return;

      const deltaX = e.clientX - dragStartX.current;
      const usableWidth = track.clientWidth - TRACK_PADDING * 2;
      const maxThumbLeft = usableWidth - thumbWidth;
      const { scrollWidth, clientWidth } = el;
      const maxScrollLeft = scrollWidth - clientWidth;

      if (maxThumbLeft <= 0) return;

      const scrollDelta = (deltaX / maxThumbLeft) * maxScrollLeft;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        el.scrollLeft = scrollStartLeft.current + scrollDelta;
        updateThumbPosition();
      });
    },
    [thumbWidth, updateThumbPosition, getScrollEl]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsThumbDragging(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
  }, []);

  // ── Thumb drag (touch) ──────────────────────────────────
  const handleThumbTouchStart = useCallback(
    (e) => {
      e.stopPropagation();
      const touch = e.touches[0];
      isDragging.current = true;
      setIsThumbDragging(true);
      dragStartX.current = touch.clientX;
      scrollStartLeft.current = getScrollEl()?.scrollLeft || 0;
    },
    [getScrollEl]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging.current) return;

      const touch = e.touches[0];
      const el = getScrollEl();
      const track = trackRef.current;
      if (!el || !track) return;

      const deltaX = touch.clientX - dragStartX.current;
      const usableWidth = track.clientWidth - TRACK_PADDING * 2;
      const maxThumbLeft = usableWidth - thumbWidth;
      const { scrollWidth, clientWidth } = el;
      const maxScrollLeft = scrollWidth - clientWidth;

      if (maxThumbLeft <= 0) return;

      const scrollDelta = (deltaX / maxThumbLeft) * maxScrollLeft;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        el.scrollLeft = scrollStartLeft.current + scrollDelta;
        updateThumbPosition();
      });
    },
    [thumbWidth, updateThumbPosition, getScrollEl]
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    setIsThumbDragging(false);
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
  }, []);

  // ── Auto-drop when pointer leaves the track ───────────
  const handleTrackMouseLeave = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsThumbDragging(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
  }, []);

  // ── Global mouse listeners for drag ─────────────────────
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // ── Track click (jump to position) ──────────────────────
  const handleTrackClick = useCallback(
    (e) => {
      // Ignore clicks on the thumb itself
      if (e.target === thumbRef.current) return;
      // Ignore the click that fires after track repositioning ends
      if (trackWasDragged.current) {
        trackWasDragged.current = false;
        return;
      }

      const el = getScrollEl();
      const track = trackRef.current;
      if (!el || !track) return;

      const trackRect = track.getBoundingClientRect();
      const clickX = e.clientX - trackRect.left - TRACK_PADDING;
      const usableWidth = track.clientWidth - TRACK_PADDING * 2;
      const { scrollWidth, clientWidth } = el;
      const maxScrollLeft = scrollWidth - clientWidth;

      const scrollRatio = Math.max(0, Math.min(1, clickX / usableWidth));
      el.scrollTo({ left: scrollRatio * maxScrollLeft, behavior: "smooth" });
    },
    [getScrollEl]
  );

  // ── Disabled mode: passthrough ──────────────────────────
  if (disabled) {
    return <>{children}</>;
  }

  // ── Track content (shared between draggable and static) ─
  const trackContent = (
    <div
      ref={trackRef}
      className="hsw-track"
      onClick={handleTrackClick}
      onMouseLeave={handleTrackMouseLeave}
    >
      <div
        ref={thumbRef}
        className={`hsw-thumb ${isThumbDragging ? "hsw-thumb--dragging" : ""}`}
        style={{
          width: `${thumbWidth}px`,
          transform: `translateX(${thumbLeft}px)`,
        }}
        onMouseDown={handleThumbMouseDown}
        onTouchStart={handleThumbTouchStart}
      />
    </div>
  );

  return (
    <div className={`hsw-wrapper ${className}`}>
      {scrollRef ? (
        // External scroll mode: children render directly, layout untouched
        children
      ) : (
        <div
          ref={internalContentRef}
          className={`hsw-content ${contentClassName}`}
        >
          {children}
        </div>
      )}

      {showScrollbar &&
        (draggable ? (
          <Draggable
            bounds="parent"
            onStart={(e) => {
              // Block track repositioning when the thumb is being dragged
              if (thumbRef.current?.contains(e.target)) return false;
            }}
            onDrag={() => {
              trackWasDragged.current = true;
            }}
          >
            {trackContent}
          </Draggable>
        ) : (
          trackContent
        ))}
    </div>
  );
};

export default HorizontalScrollWrapper;
