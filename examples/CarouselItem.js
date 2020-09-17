/* eslint-disable react/prop-types */
import React from "react";
import styles from "./CarouselItem.module.css";
import useCarouselItem from "../src/hooks/useCarouselItem";
import clsx from "clsx";

export default React.forwardRef(function CarouselItem(
  {
    url,
    className,
    onOffset,
    onLeft,
    onRight,
    onScaleSnap,
    onXYSnap,
    onTouchStart,
  },
  ref
) {
  useCarouselItem(ref, {
    onOffset,
    onLeft,
    onRight,
    onScaleSnap,
    onXYSnap,
    onTouchStart,
  });
  return (
    <img
      className={clsx(styles.image, className)}
      ref={ref}
      src={url}
      alt="Carousel Sample"
    />
  );
});