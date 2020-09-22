import usePinchPan, { EventHandler, PinchPanState } from "./usePinchPan";
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

export interface CarouselItemTouchMoveState {
  offsetTopLeft: XY;
  offsetBottomRight: XY;

  // Hysteresis values
  translateXY: XY;
  timeStamp?: number;
  prevTimeStamp?: number;
  prevTranslateXY: XY;

  // Axis locking
  activeAxis: Axis;
}

export interface CarouselItemState extends PinchPanState {
  carouselItemTouchMoveState: CarouselItemTouchMoveState;
}

export interface CarouselItemOptions {
  onTouchStart: EventHandler;
  onSwipeHoriz: (direction: "left" | "right") => void;
  disableSwipeLeft: boolean;
  disableSwipeRight: boolean;
  onOffset: (offsetTopLeft: XY, offsetBottomRight: XY) => void;
  onScaleSnap: () => void;
  onXYSnap: () => void;
}

export default function useCarouselItem(
  ref: RefObject<HTMLElement>,
  options:
    | CarouselItemOptions
    | ((state: CarouselItemState) => CarouselItemOptions)
): void {
  usePinchPan(ref, ({ touchStartState, touchMoveState }) => {
    const carouselItemTouchMoveState: CarouselItemTouchMoveState = {
      offsetTopLeft: [0, 0],
      offsetBottomRight: [0, 0],

      // Hysteresis values
      translateXY: [0, 0],
      timeStamp: undefined,
      prevTimeStamp: undefined,
      prevTranslateXY: [0, 0],

      // Axis locking
      activeAxis: "any",
    };

    const {
      onTouchStart,
      onSwipeHoriz,
      disableSwipeLeft,
      disableSwipeRight,
      onOffset,
      onScaleSnap,
      onXYSnap,
    } =
      typeof options === "function"
        ? options({
            touchStartState,
            touchMoveState,
            carouselItemTouchMoveState,
          })
        : options;

    function handleTouchStart(event: TouchEvent): false | void {
      if (onTouchStart(event) === false || event.touches.length) {
        return;
      }

      const {
        offsetTopLeft,
        offsetBottomRight,
        timeStamp,
        prevTimeStamp,
        prevTranslateXY,
      } = carouselItemTouchMoveState;
      const { translateXY, scaleFactor } = touchMoveState;
      const { clientRect, scaleFactor: startScaleFactor } = touchStartState;

      if (!clientRect || !timeStamp || !prevTimeStamp) {
        return;
      }
      const { width } = clientRect;

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

      if (onSwipeHoriz) {
        if (
          !disableSwipeLeft &&
          (offsetTopLeft[0] > thresholdWidth ||
            (scaleFactor === 1 &&
              offsetTopLeft[0] > 0 &&
              velocity > VELOCITY_THRESHOLD))
        ) {
          onSwipeHoriz("left");
          return false;
        }
        if (
          !disableSwipeRight &&
          (offsetBottomRight[0] < -thresholdWidth ||
            (scaleFactor === 1 &&
              offsetBottomRight[0] < 0 &&
              velocity < -VELOCITY_THRESHOLD))
        ) {
          onSwipeHoriz("right");
          return false;
        }
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
    function handleTouchMove(event: TouchEvent): void {
      const { translateXY, scaleFactor } = touchMoveState;
      const {
        transformOriginXY,
        scaleFactor: startScaleFactor,
        clientRect,
      } = touchStartState;
      if (!clientRect) {
        return;
      }
      const { width, height } = clientRect;

      const {
        timeStamp: prevTimeStamp,
        translateXY: prevTranslateXY,
        activeAxis: prevActiveAxis,
      } = carouselItemTouchMoveState;
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

      carouselItemTouchMoveState.offsetTopLeft = offsetTopLeft;
      carouselItemTouchMoveState.offsetBottomRight = offsetBottomRight;
      carouselItemTouchMoveState.timeStamp = timeStamp;
      carouselItemTouchMoveState.prevTimeStamp = prevTimeStamp;
      carouselItemTouchMoveState.translateXY = translateXY;
      carouselItemTouchMoveState.prevTranslateXY = prevTranslateXY;
      carouselItemTouchMoveState.activeAxis = activeAxis;
    }
    return { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove };
  });
}
