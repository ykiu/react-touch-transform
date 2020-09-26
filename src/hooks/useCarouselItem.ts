import usePinchPan, { EventHandler, PinchPanState } from "./usePinchPan";
import {
  mulXY,
  divXY,
  subXY,
  addXY,
  getDistance,
  XY,
  touchToXY,
} from "../utils";
import { RefObject } from "react";

const VELOCITY_THRESHOLD = 0.1;
const AXIS_LOCK_THRESHOLD = 5;
const DOUBLE_TAP_MOVEMENT_THRESHOLD = 10;
const DOUBLE_TAP_INTERVAL_THRESHOLD = 500;

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

function swapOrigin(xy: XY, dimensions: XY, scaleFactor: number) {
  return subXY(xy, divXY(dimensions, scaleFactor));
}

function deriveOffset(
  translateXY: XY,
  transformOriginXY: XY,
  scaleFactor: number
): XY {
  const scalingOffset = mulXY(transformOriginXY, 1 - scaleFactor);
  const offset = addXY(translateXY, scalingOffset);
  return offset;
}

function deriveDoubleTapXY(event: TouchEvent): XY | undefined {
  if (event.touches.length === 1) {
    return touchToXY(event.touches[0]);
  }
  return undefined;
}

function detectDoubleTap(
  event: TouchEvent,
  doubletapXY: XY,
  doubletapTimeStamp: number
) {
  if (
    getDistance(touchToXY(event.changedTouches[0]), doubletapXY) >
    DOUBLE_TAP_MOVEMENT_THRESHOLD
  ) {
    return false;
  }
  if (event.timeStamp - doubletapTimeStamp > DOUBLE_TAP_INTERVAL_THRESHOLD) {
    return false;
  }
  return true;
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

export interface CarouselItemTouchStartState {
  doubletapXY?: XY;
  doubletapTimeStamp: number;
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

    const carouselItemTouchStartState: CarouselItemTouchStartState = {
      doubletapXY: undefined,
      doubletapTimeStamp: -Infinity,
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
      const { doubletapTimeStamp, doubletapXY } = carouselItemTouchStartState;
      const {
        offsetTopLeft,
        offsetBottomRight,
        timeStamp,
        prevTimeStamp,
        prevTranslateXY,
      } = carouselItemTouchMoveState;
      const { translateXY, scaleFactor } = touchMoveState;
      const { clientRect, scaleFactor: startScaleFactor } = touchStartState;

      if (event.type === "touchstart") {
        carouselItemTouchStartState.doubletapXY = deriveDoubleTapXY(event);
      } else if (doubletapXY && event.touches.length === 0) {
        // assuming touchend
        if (detectDoubleTap(event, doubletapXY, doubletapTimeStamp)) {
          touchStartState.scaleFactor = scaleFactor < 1.5 ? 2 : 1;
          touchStartState.translateXY = [0, 0];
          onScaleSnap();
          return;
        } else {
          carouselItemTouchStartState.doubletapTimeStamp = event.timeStamp;
        }
      }

      if (onTouchStart(event) === false || event.touches.length) {
        return;
      }

      if (!clientRect || !timeStamp || !prevTimeStamp) {
        return;
      }
      const { width } = clientRect;

      if (scaleFactor < 1) {
        touchStartState.scaleFactor = 1;
        touchStartState.translateXY = [0, 0];
        onScaleSnap();
        return;
      }

      const velocity =
        (translateXY[0] - prevTranslateXY[0]) / (timeStamp - prevTimeStamp);
      const thresholdWidth = (width / startScaleFactor) * 0.5;

      function shouldSwipe(position: number, velocity: number): boolean {
        return (
          position > thresholdWidth ||
          (scaleFactor === 1 && position > 0 && velocity > VELOCITY_THRESHOLD)
        );
      }

      if (onSwipeHoriz) {
        if (!disableSwipeLeft && shouldSwipe(offsetTopLeft[0], velocity)) {
          onSwipeHoriz("left");
          return false;
        }
        if (
          !disableSwipeRight &&
          shouldSwipe(-offsetBottomRight[0], -velocity)
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
        carouselItemTouchMoveState.offsetTopLeft = [0, 0];
        carouselItemTouchMoveState.offsetBottomRight = [0, 0];
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

      const offsetTopLeft = deriveOffset(
        translateXY,
        transformOriginXY,
        scaleFactor
      );
      const offsetBottomRight = deriveOffset(
        translateXY,
        swapOrigin(transformOriginXY, [width, height], startScaleFactor),
        scaleFactor
      );

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
