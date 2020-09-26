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

const { min, max } = Math;
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

function deriveSnapDelta(offsetTopLeft: XY, offsetBottomRight: XY): XY {
  const snapDeltaX = max(0, offsetTopLeft[0]) || min(0, offsetBottomRight[0]);
  const snapDeltaY = max(0, offsetTopLeft[1]) || min(0, offsetBottomRight[1]);
  return [snapDeltaX, snapDeltaY];
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
  offsetTopLeft: XY;
  offsetBottomRight: XY;
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
      offsetTopLeft: [0, 0],
      offsetBottomRight: [0, 0],
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
      const {
        doubletapTimeStamp,
        doubletapXY,
        offsetTopLeft: startOffsetTopLeft,
        offsetBottomRight: startOffsetBottomRight,
      } = carouselItemTouchStartState;
      const {
        offsetTopLeft,
        offsetBottomRight,
        timeStamp,
        prevTimeStamp,
        prevTranslateXY,
      } = carouselItemTouchMoveState;
      const { translateXY, scaleFactor } = touchMoveState;
      const {
        clientRect,
        scaleFactor: startScaleFactor,
        translateXY: startTranslateXY,
      } = touchStartState;

      const returnValue = (() => {
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

        const shouldSwipe = (
          startPosition: number,
          position: number,
          velocity: number
        ): boolean => {
          return (
            startPosition === 0 &&
            (position > thresholdWidth ||
              (position > 0 && velocity > VELOCITY_THRESHOLD))
          );
        };

        if (onSwipeHoriz) {
          if (
            !disableSwipeLeft &&
            shouldSwipe(startOffsetTopLeft[0], offsetTopLeft[0], velocity)
          ) {
            onSwipeHoriz("left");
            return false;
          }
          if (
            !disableSwipeRight &&
            shouldSwipe(
              -startOffsetBottomRight[0],
              -offsetBottomRight[0],
              -velocity
            )
          ) {
            onSwipeHoriz("right");
            return false;
          }
        }
        const snapDelta = deriveSnapDelta(offsetTopLeft, offsetBottomRight);
        touchStartState.translateXY = subXY(startTranslateXY, snapDelta);
        carouselItemTouchStartState.offsetTopLeft = subXY(
          offsetTopLeft,
          snapDelta
        );
        carouselItemTouchStartState.offsetBottomRight = subXY(
          offsetBottomRight,
          snapDelta
        );
        if (snapDelta[0] !== 0 || snapDelta[1] !== 0) {
          onXYSnap();
        }
      })();

      carouselItemTouchMoveState.offsetTopLeft =
        carouselItemTouchStartState.offsetTopLeft;
      carouselItemTouchMoveState.offsetBottomRight =
        carouselItemTouchStartState.offsetBottomRight;
      return returnValue;
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
