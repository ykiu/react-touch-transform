import { MutableRefObject, RefObject, useLayoutEffect, useRef } from "react";
import { noop, XY } from "../utils";

function styleRefElement(
  ref: RefObject<HTMLElement>,
  style: Partial<CSSStyleDeclaration>
) {
  if (!ref.current) {
    return;
  }
  Object.assign(ref.current.style, style);
}

const transitionRefElement = (
  transitionStyle: Partial<CSSStyleDeclaration>,
  endStyle: Partial<CSSStyleDeclaration>
) => (
  { current: element }: RefObject<HTMLElement>,
  terminateTransitionRef: RefObject<() => void>
) => {
  if (!element) {
    return;
  }
  const { style } = element;
  Object.assign(style, transitionStyle);
  const terminate = () => {
    Object.assign(style, endStyle);
    element.removeEventListener("transitionend", terminate);
    (terminateTransitionRef as MutableRefObject<
      typeof terminateTransitionRef.current
    >).current = noop;
  };
  element.addEventListener("transitionend", terminate);
  (terminateTransitionRef as MutableRefObject<
    typeof terminateTransitionRef.current
  >).current = terminate;
};

function createTransition(ms: number): string {
  return `transform ${ms}ms cubic-bezier(.17,.95,.45,.99)`;
}

const shiftTransition = transitionRefElement(
  { transition: createTransition(700) },
  { transition: undefined }
);

const scaleSnapTransition = transitionRefElement(
  { transition: createTransition(300) },
  { transition: undefined }
);

export interface CarouselContainerOptions<T> {
  value: T;
  onSwipe: (direction: "left" | "right") => void;
  prevElementStyle: (
    offsetTopLeft: XY,
    offsetBottomRight: XY
  ) => Partial<CSSStyleDeclaration>;
  prevElementStyleCleanUp: Partial<CSSStyleDeclaration>;
  nextElementStyle: (
    offsetTopLeft: XY,
    offsetBottomRight: XY
  ) => Partial<CSSStyleDeclaration>;
  nextElementStyleCleanUp: Partial<CSSStyleDeclaration>;
}

export interface CarouselContainerUtils {
  onOffset: (offsetTopLeft: XY, offsetBottomRight: XY) => void;
  onScaleSnap: () => void;
  onSwipeHoriz: (direction: "left" | "right") => void;
  onTouchStart: () => void;
  onXYSnap: () => void;
}

export default function useCarouselContainer<T>(
  prev: RefObject<HTMLElement>,
  current: RefObject<HTMLElement>,
  next: RefObject<HTMLElement>,
  {
    value,
    onSwipe,
    prevElementStyle,
    prevElementStyleCleanUp,
    nextElementStyle,
    nextElementStyleCleanUp,
  }: CarouselContainerOptions<T>
): CarouselContainerUtils {
  const prevTerminateTransition = useRef(noop);
  const currentTerminateTransition = useRef(noop);
  const nextTerminateTransition = useRef(noop);
  function handleOffset(offsetTopLeft: XY, offsetBottomRight: XY) {
    styleRefElement(prev, prevElementStyle(offsetTopLeft, offsetBottomRight));
    styleRefElement(next, nextElementStyle(offsetTopLeft, offsetBottomRight));
  }

  function handleScaleSnap() {
    scaleSnapTransition(prev, prevTerminateTransition);
    scaleSnapTransition(current, currentTerminateTransition);
    scaleSnapTransition(next, nextTerminateTransition);
    styleRefElement(prev, prevElementStyle([0, 0], [0, 0]));
    styleRefElement(next, nextElementStyle([0, 0], [0, 0]));
  }

  function handleXYSnap() {
    shiftTransition(prev, prevTerminateTransition);
    shiftTransition(current, currentTerminateTransition);
    shiftTransition(next, nextTerminateTransition);
    styleRefElement(prev, prevElementStyle([0, 0], [0, 0]));
    styleRefElement(next, nextElementStyle([0, 0], [0, 0]));
  }

  function handleSwipeHoriz(direction: "left" | "right") {
    shiftTransition(prev, prevTerminateTransition);
    shiftTransition(current, currentTerminateTransition);
    shiftTransition(next, nextTerminateTransition);
    onSwipe(direction);
  }

  function handleTouchStart() {
    prevTerminateTransition.current();
    currentTerminateTransition.current();
    nextTerminateTransition.current();
  }

  useLayoutEffect(() => {
    styleRefElement(prev, prevElementStyle([0, 0], [0, 0]));
    styleRefElement(next, nextElementStyle([0, 0], [0, 0]));
    const prevElement = prev.current;
    const nextElement = next.current;
    return () => {
      if (prevElement)
        Object.assign(prevElement.style, prevElementStyleCleanUp);
      if (nextElement)
        Object.assign(nextElement.style, nextElementStyleCleanUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return {
    onOffset: handleOffset,
    onScaleSnap: handleScaleSnap,
    onSwipeHoriz: handleSwipeHoriz,
    onTouchStart: handleTouchStart,
    onXYSnap: handleXYSnap,
  };
}
