import React, { useRef, useState, useLayoutEffect } from "react";
import styles from "./Carousel.module.css";
import { noop } from "../src/utils";
import CarouselItem from "./CarouselItem";

const urls = [
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/xjT82CBesKbu/d59618c2cb672295e0f5128f973eba7a.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/nz6yjgPCzOTn/e4ec350fdb527db8b2327b846557980b.JPG",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/JtCds0TxjDmo/d442e0a771e9ae3bf0abea6fac32aae5.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/c2EVvg4ZeFnt/74741ba4879bef80bb62b940d6d33e61.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/jCURAWhRo6zh/2a248cf665fc2d493ee966e39189c1a3.jpg",
];

function translateRefElement(ref, px, percent) {
  if (!ref.current) {
    return;
  }
  ref.current.style.transform = `translateX(calc(${px}px + ${percent}%))`;
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

// eslint-disable-next-line react/prop-types
export default function Carousel({ className }) {
  const [index, setIndex] = useState(1);
  const prev = useRef(null);
  const current = useRef(null);
  const next = useRef(null);
  const prevTerminateTransition = useRef(noop);
  const currentTerminateTransition = useRef(noop);
  const nextTerminateTransition = useRef(noop);
  function handleOffset(offsetTopLeft, offsetBottomRight) {
    if (offsetTopLeft[0] > 0) {
      translateRefElement(prev, offsetTopLeft[0], -100);
    }
    if (offsetBottomRight[0] < 0) {
      translateRefElement(next, offsetBottomRight[0], 100);
    }
  }

  function handleScaleSnap() {
    scaleSnapTransition(prev, prevTerminateTransition);
    scaleSnapTransition(current, currentTerminateTransition);
    scaleSnapTransition(next, nextTerminateTransition);
    translateRefElement(prev, 0, -100);
    translateRefElement(next, 0, 100);
  }

  function handleXYSnap() {
    shiftTransition(prev, prevTerminateTransition);
    shiftTransition(current, currentTerminateTransition);
    shiftTransition(next, nextTerminateTransition);
    translateRefElement(prev, 0, -100);
    translateRefElement(next, 0, 100);
  }

  function handleShift(v) {
    shiftTransition(prev, prevTerminateTransition);
    shiftTransition(current, currentTerminateTransition);
    shiftTransition(next, nextTerminateTransition);
    setIndex((currentIndex) => {
      if ((!prev.current && v < 0) || (!next.current && v > 0)) {
        return currentIndex;
      }
      return currentIndex + v;
    });
  }

  function handleTouchStart() {
    prevTerminateTransition.current();
    currentTerminateTransition.current();
    nextTerminateTransition.current();
  }

  useLayoutEffect(() => {
    translateRefElement(prev, 0, -100);
    translateRefElement(current, 0, 0);
    translateRefElement(next, 0, 100);
  }, [index]);

  return (
    <div className={[styles.carousel, className].filter(Boolean).join(" ")}>
      {[null, ...urls, null].slice(index - 1, index + 2).map((url, i, arr) => {
        return (
          url && (
            <CarouselItem
              key={url}
              ref={[prev, current, next][i]}
              url={url}
              onOffset={handleOffset}
              onLeft={arr[i - 1] == null ? null : () => handleShift(-1)}
              onRight={arr[i + 1] == null ? null : () => handleShift(1)}
              onScaleSnap={handleScaleSnap}
              onXYSnap={handleXYSnap}
              onTouchStart={handleTouchStart}
              className={i === 1 ? null : "image-prevnext"}
            />
          )
        );
      })}
    </div>
  );
}
