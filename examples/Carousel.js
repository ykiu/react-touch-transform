import React, { useRef, useState, useLayoutEffect } from "react";
import styles from "./Carousel.module.css";
import { noop } from "../src/utils";
import CarouselItem from "./CarouselItem";
import clsx from "clsx";

const urls = [
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/xjT82CBesKbu/d59618c2cb672295e0f5128f973eba7a.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/nz6yjgPCzOTn/e4ec350fdb527db8b2327b846557980b.JPG",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/JtCds0TxjDmo/d442e0a771e9ae3bf0abea6fac32aae5.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/c2EVvg4ZeFnt/74741ba4879bef80bb62b940d6d33e61.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/jCURAWhRo6zh/2a248cf665fc2d493ee966e39189c1a3.jpg",
];

function styleRefElement(ref, style) {
  if (!ref.current) {
    return;
  }
  Object.assign(ref.current.style, style);
}

const transitionRefElement = (transitionStyle, endStyle) => (
  { current: element },
  terminateTransitionRef
) => {
  if (!element) {
    return;
  }
  const { style } = element;
  Object.assign(style, transitionStyle);
  function terminate() {
    Object.assign(style, endStyle);
    element.removeEventListener("transitionend", terminate);
    terminateTransitionRef.current = noop;
  }
  element.addEventListener("transitionend", terminate);
  terminateTransitionRef.current = terminate;
};

function createTransition(ms) {
  return `transform ${ms}ms cubic-bezier(.17,.95,.45,.99)`;
}

const shiftTransition = transitionRefElement(
  { transition: createTransition(700) },
  { transition: null }
);

const scaleSnapTransition = transitionRefElement(
  { transition: createTransition(300) },
  { transition: null }
);

function prevElementStyle(offsetTopLeft) {
  return { transform: `translateX(calc(${offsetTopLeft[0]}px - 100%))` };
}

const prevElementStyleCleanUp = { transform: null };

function nextElementStyle(offsetTopLeft, offsetBottomRight) {
  return { transform: `translateX(calc(${offsetBottomRight[0]}px + 100%))` };
}

const nextElementStyleCleanUp = { transform: null };

function useCarouselContainer({
  value,
  onChange,
  prev,
  current,
  next,
  prevElementStyle,
  prevElementStyleCleanUp,
  nextElementStyle,
  nextElementStyleCleanUp,
}) {
  const prevTerminateTransition = useRef(noop);
  const currentTerminateTransition = useRef(noop);
  const nextTerminateTransition = useRef(noop);
  function handleOffset(offsetTopLeft, offsetBottomRight) {
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

  function handleSwipeHoriz(direction) {
    shiftTransition(prev, prevTerminateTransition);
    shiftTransition(current, currentTerminateTransition);
    shiftTransition(next, nextTerminateTransition);
    const deltaValue = direction === "left" ? -1 : 1;
    onChange(value + deltaValue);
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
    handleOffset,
    handleScaleSnap,
    handleSwipeHoriz,
    handleTouchStart,
    handleXYSnap,
  };
}

// eslint-disable-next-line react/prop-types
export default function Carousel({ className }) {
  const [value, setValue] = useState(0);
  const prev = useRef(null);
  const current = useRef(null);
  const next = useRef(null);
  const {
    handleOffset,
    handleSwipeHoriz,
    handleScaleSnap,
    handleXYSnap,
    handleTouchStart,
  } = useCarouselContainer({
    value,
    onChange: setValue,
    prev,
    current,
    next,
    prevElementStyle,
    prevElementStyleCleanUp,
    nextElementStyle,
    nextElementStyleCleanUp,
  });
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.carousel}>
        {[prev, current, next].map((ref, i) => {
          const urlIndex = value + i - 1;
          const url = urls[urlIndex];
          const isFirst = urlIndex === 0;
          const isLast = urlIndex === urls.length - 1;
          return (
            url && (
              <CarouselItem
                key={url}
                ref={ref}
                url={url}
                onOffset={handleOffset}
                onSwipeHoriz={handleSwipeHoriz}
                disableSwipeLeft={isFirst}
                disableSwipeRight={isLast}
                onScaleSnap={handleScaleSnap}
                onXYSnap={handleXYSnap}
                onTouchStart={handleTouchStart}
              />
            )
          );
        })}
      </div>
    </div>
  );
}
