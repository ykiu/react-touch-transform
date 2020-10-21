import { MutableRefObject, RefObject, useRef } from "react";
import { SwipeDirection } from "./useCarouselItem";
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
  terminateTransitionRef: MutableRefObject<() => void>
) => {
  if (!element) {
    return;
  }
  const { style } = element;
  Object.assign(style, transitionStyle);
  const terminate = () => {
    Object.assign(style, endStyle);
    element.removeEventListener("transitionend", terminate);
    terminateTransitionRef.current = noop;
  };
  element.addEventListener("transitionend", terminate);
  terminateTransitionRef.current = terminate;
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

export interface CarouselContainerOptions {
  onSwipe: (direction: SwipeDirection) => void;
  prevElementStyle: (
    offsetTopLeft: XY,
    offsetBottomRight: XY
  ) => Partial<CSSStyleDeclaration>;
  nextElementStyle: (
    offsetTopLeft: XY,
    offsetBottomRight: XY
  ) => Partial<CSSStyleDeclaration>;
}

export interface CarouselContainerUtils {
  onSwipe: (direction: SwipeDirection) => void;
  onOffset: (offsetTopLeft: XY, offsetBottomRight: XY) => void;
  onScaleSnap: () => void;
  onTouchStart: () => void;
  onXYSnap: () => void;
}

export function useCarouselContainer(
  prev: RefObject<HTMLElement>,
  current: RefObject<HTMLElement>,
  next: RefObject<HTMLElement>,
  { onSwipe, prevElementStyle, nextElementStyle }: CarouselContainerOptions
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

  function handleSwipe(direction: SwipeDirection) {
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

  return {
    onSwipe: handleSwipe,
    onOffset: handleOffset,
    onScaleSnap: handleScaleSnap,
    onTouchStart: handleTouchStart,
    onXYSnap: handleXYSnap,
  };
}
