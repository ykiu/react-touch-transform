import usePinchPan, { EventHandler } from "./usePinchPan";
import { mulXY, divXY, subXY, addXY, getDistance, XY } from "../utils";
import { RefObject } from "react";

const VELOCITY_THRESHOLD = 0.5;
const AXIS_LOCK_THRESHOLD = 20;

type Axis = "x" | "y" | "any";

function deriveAxis(
  translateXY: XY,
  scaleFactor: number,
  prevAxis: Axis
): Axis {
  if (scaleFactor !== 1) {
    return "any";
  }
  const distance = getDistance([0, 0], translateXY);
  if (distance > AXIS_LOCK_THRESHOLD) {
    return prevAxis;
  }
  return Math.abs(translateXY[0]) > Math.abs(translateXY[1]) ? "x" : "y";
}

export interface CarouselItemOptions {
  onTouchStart: EventHandler;
  onLeft: () => void;
  onRight: () => void;
  onOffset: (offsetTopLeft: XY, offsetBottomRight: XY) => void;
  onScaleSnap: () => void;
  onXYSnap: () => void;
}

interface CarouselItemMoveState {
  offsetTopLeft: XY;
  offsetBottomRight: XY;

  // Hysteresis values
  translateXY: XY;
  timeStamp: number;
  prevTimeStamp: number;
  prevTranslateXY: XY;

  // Axis locking
  activeAxis: Axis;
}

export default function useCarouselItem(
  ref: RefObject<HTMLElement>,
  {
    onTouchStart,
    onLeft,
    onRight,
    onOffset,
    onScaleSnap,
    onXYSnap,
  }: CarouselItemOptions
): void {
  const makeHandlers = ({ touchStartState, touchMoveState }) => {
    const extraTouchMoveState: CarouselItemMoveState = {
      offsetTopLeft: [0, 0],
      offsetBottomRight: [0, 0],

      // Hysteresis values
      translateXY: [0, 0],
      timeStamp: null,
      prevTimeStamp: null,
      prevTranslateXY: [0, 0],

      // Axis locking
      activeAxis: "any",
    };

    function handleTouchStart(event): false | void {
      if (onTouchStart(event) === false || event.touches.length) {
        return;
      }

      const {
        offsetTopLeft,
        offsetBottomRight,
        timeStamp,
        prevTimeStamp,
        prevTranslateXY,
      } = extraTouchMoveState;
      const { translateXY, scaleFactor } = touchMoveState;
      const {
        clientRect: { width },
        scaleFactor: startScaleFactor,
      } = touchStartState;

      if (scaleFactor < 1) {
        touchStartState.scaleFactor = 1;
        touchMoveState.scaleFactor = 1;
        touchStartState.translateXY = [0, 0];
        touchMoveState.translateXY = [0, 0];
        onScaleSnap();
        return;
      }

      const velocity =
        (translateXY[0] - prevTranslateXY[0]) / (timeStamp - prevTimeStamp);
      const thresholdWidth = (width / startScaleFactor) * 0.5;

      if (
        onLeft &&
        (offsetTopLeft[0] > thresholdWidth ||
          (scaleFactor === 1 &&
            offsetTopLeft[0] > 0 &&
            velocity > VELOCITY_THRESHOLD))
      ) {
        onLeft();
        return false;
      }
      if (
        onRight &&
        (offsetBottomRight[0] < -thresholdWidth ||
          (scaleFactor === 1 &&
            offsetBottomRight[0] < 0 &&
            velocity < -VELOCITY_THRESHOLD))
      ) {
        onRight();
        return false;
      }
      let xySnapped = false;
      if (offsetTopLeft[0] > 0) {
        xySnapped = true;
        touchStartState.translateXY[0] -= offsetTopLeft[0];
      }
      if (offsetTopLeft[1] > 0) {
        xySnapped = true;
        touchStartState.translateXY[1] -= offsetTopLeft[1];
      }
      if (offsetBottomRight[0] < 0) {
        xySnapped = true;
        touchStartState.translateXY[0] -= offsetBottomRight[0];
      }
      if (offsetBottomRight[1] < 0) {
        xySnapped = true;
        touchStartState.translateXY[1] -= offsetBottomRight[1];
      }
      if (xySnapped) {
        onXYSnap();
      }
    }
    function handleTouchMove(event): void {
      const { translateXY, scaleFactor } = touchMoveState;
      const {
        transformOriginXY,
        scaleFactor: startScaleFactor,
        clientRect: { width, height },
      } = touchStartState;
      const {
        timeStamp: prevTimeStamp,
        translateXY: prevTranslateXY,
        activeAxis: prevActiveAxis,
      } = extraTouchMoveState;
      const { timeStamp } = event;

      // Lock axis
      const activeAxis = deriveAxis(translateXY, scaleFactor, prevActiveAxis);
      if (activeAxis === "x") {
        translateXY[1] = 0;
      } else if (activeAxis === "y") {
        translateXY[0] = 0;
      }

      // Derive scaling offset for each corner
      const scalingOffsetTopLeft = mulXY(transformOriginXY, 1 - scaleFactor);
      const scalingOffsetBottomRight = mulXY(
        subXY(divXY([width, height], startScaleFactor), transformOriginXY),
        scaleFactor - 1
      );

      // Derive offset including translation for each corner
      const offsetTopLeft = addXY(translateXY, scalingOffsetTopLeft);
      const offsetBottomRight = addXY(translateXY, scalingOffsetBottomRight);

      onOffset(offsetTopLeft, offsetBottomRight);

      extraTouchMoveState.offsetTopLeft = offsetTopLeft;
      extraTouchMoveState.offsetBottomRight = offsetBottomRight;
      extraTouchMoveState.timeStamp = timeStamp;
      extraTouchMoveState.prevTimeStamp = prevTimeStamp;
      extraTouchMoveState.translateXY = translateXY;
      extraTouchMoveState.prevTranslateXY = prevTranslateXY;
      extraTouchMoveState.activeAxis = activeAxis;
    }
    return { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove };
  };
  usePinchPan(ref, { makeHandlers });
}
