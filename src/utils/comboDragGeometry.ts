import { NativeScrollEvent } from "react-native";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Combo card width (120) plus its horizontal margins (5 each side). */
export const CARD_WIDTH = 130;

/** Horizontal padding on the drop zone's scroll content. */
export const CONTENT_PADDING = 15;

/** How close to an edge a drag must get before the drop zone auto-scrolls. */
export const SCROLL_ZONE_SIZE = 60;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

export const isPointInside = (rect: Rect, x: number, y: number): boolean =>
  x >= rect.x && x <= rect.x + rect.width &&
  y >= rect.y && y <= rect.y + rect.height;

/**
 * All combo drag math is expressed in "distance along the sequence": 0 is the
 * first card and it grows towards the last one, whichever physical direction
 * that runs in. Only the functions in this module know about left and right,
 * so the drag handlers stay identical in both languages.
 */
export const distanceAlongSequence = (
  rect: Rect,
  pointerX: number,
  isRTL: boolean
): number => {
  const relativeX = pointerX - rect.x;
  const fromStart = isRTL ? rect.width - relativeX : relativeX;
  return fromStart - CONTENT_PADDING;
};

/** Index a card would be inserted at, given where the pointer is. */
export const insertIndexAt = (
  rect: Rect,
  pointerX: number,
  scrollAlong: number,
  comboLength: number,
  isRTL: boolean
): number => {
  const along = distanceAlongSequence(rect, pointerX, isRTL) + scrollAlong;
  return clamp(Math.round(along / CARD_WIDTH), 0, comboLength);
};

/**
 * Converts a native scroll position into distance-along-sequence. Under RTL a
 * horizontal ScrollView still reports a physical offset measured from the left,
 * so the sequence start sits at the maximum offset rather than at zero.
 */
export const scrollAlongFromEvent = (
  event: NativeScrollEvent,
  isRTL: boolean
): number => {
  const { contentOffset, contentSize, layoutMeasurement } = event;
  if (!isRTL) return Math.max(0, contentOffset.x);

  const maxOffset = Math.max(0, contentSize.width - layoutMeasurement.width);
  return clamp(maxOffset - contentOffset.x, 0, maxOffset);
};

/** Inverse of the above: the physical x to pass to scrollTo. */
export const physicalScrollX = (
  scrollAlong: number,
  contentWidth: number,
  viewportWidth: number,
  isRTL: boolean
): number => {
  const maxOffset = Math.max(0, contentWidth - viewportWidth);
  const along = clamp(scrollAlong, 0, maxOffset);
  return isRTL ? maxOffset - along : along;
};

/** Which way a drag near the edges should scroll, in sequence terms. */
export const autoScrollDirection = (
  rect: Rect,
  pointerX: number,
  isRTL: boolean
): "back" | "forward" | null => {
  const along = distanceAlongSequence(rect, pointerX, isRTL);
  if (along < SCROLL_ZONE_SIZE) return "back";
  if (along > rect.width - SCROLL_ZONE_SIZE) return "forward";
  return null;
};
