import React, { useRef, useState } from "react";
import styles from "./Carousel.module.css";
import CarouselItem from "./CarouselItem";
import clsx from "clsx";
import useCarouselContainer from "../src/hooks/useCarouselContainer";

const urls = [
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/xjT82CBesKbu/d59618c2cb672295e0f5128f973eba7a.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/nz6yjgPCzOTn/e4ec350fdb527db8b2327b846557980b.JPG",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/JtCds0TxjDmo/d442e0a771e9ae3bf0abea6fac32aae5.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/c2EVvg4ZeFnt/74741ba4879bef80bb62b940d6d33e61.jpg",
  "https://storage.googleapis.com/species.appspot.com/CACHE/images/observation_photos/jCURAWhRo6zh/2a248cf665fc2d493ee966e39189c1a3.jpg",
];

function prevElementStyle(offsetTopLeft) {
  return { transform: `translateX(calc(${offsetTopLeft[0]}px - 100%))` };
}

const prevElementStyleCleanUp = { transform: null };

function nextElementStyle(offsetTopLeft, offsetBottomRight) {
  return { transform: `translateX(calc(${offsetBottomRight[0]}px + 100%))` };
}

const nextElementStyleCleanUp = { transform: null };

// eslint-disable-next-line react/prop-types
export default function Carousel({ className }) {
  const [value, setValue] = useState(0);
  const prev = useRef(null);
  const current = useRef(null);
  const next = useRef(null);
  const onSwipe = (direction) =>
    setValue((value) => value + (direction === "left" ? -1 : 1));
  const {
    onOffset,
    onSwipeHoriz,
    onScaleSnap,
    onXYSnap,
    onTouchStart,
  } = useCarouselContainer(prev, current, next, {
    value,
    onSwipe,
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
                disableSwipeLeft={isFirst}
                disableSwipeRight={isLast}
                onOffset={onOffset}
                onSwipeHoriz={onSwipeHoriz}
                onScaleSnap={onScaleSnap}
                onXYSnap={onXYSnap}
                onTouchStart={onTouchStart}
              />
            )
          );
        })}
      </div>
    </div>
  );
}
