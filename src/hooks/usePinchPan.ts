import { RefObject, useLayoutEffect } from "react";
import { addXY, divXY, getDistance, mulXY, noop, subXY, XY } from "../utils";

function touchToXY(touch: Touch): XY {
  return [touch.clientX, touch.clientY];
}

function getMiddleXY(xy1: XY, xy2: XY): XY {
  return [(xy1[0] + xy2[0]) / 2, (xy1[1] + xy2[1]) / 2];
}

function preventDefault(event: Event): void {
  if (event.cancelable) {
    event.preventDefault();
  }
}

const mutateStateDefault = {
  onTouchStart: noop,
  onTouchMove: noop,
};

export interface EventHandler {
  (event: TouchEvent): false | void;
}

export interface TouchStartState {
  middleXY: XY;
  distance: number;
  clientRect?: DOMRect;
  translateXY: XY;
  scaleFactor: number;
  scalingOffset: XY;
  transformOriginXY: XY;
}

export interface TouchMoveState {
  scaleFactor: number;
  translateXY: XY;
}

export interface PinchPanState {
  touchMoveState: TouchMoveState;
  touchStartState: TouchStartState;
}

export interface PinchPanOptions {
  onTouchMove?: EventHandler;
  onTouchStart?: EventHandler;
}

export default function usePinchPan(
  elementRef: RefObject<HTMLElement>,
  options: PinchPanOptions | ((state: PinchPanState) => PinchPanOptions) = {}
): void {
  useLayoutEffect(() => {
    const element = elementRef.current as NonNullable<
      typeof elementRef.current
    >;
    if (!element) {
      console.warn(
        "usePinchPan() expected to receive a ref to an HTMLElement, but got an empty ref"
      );
      return;
    }
    function applyTransform(translateXY: XY, scaleFactor: number): void {
      element.style.transform = `translate(${translateXY[0]}px, ${translateXY[1]}px) scale(${scaleFactor})`;
    }
    function applyTransformOrigin(transformOriginXY: XY): void {
      element.style.transformOrigin = `${transformOriginXY[0]}px ${transformOriginXY[1]}px`;
    }
    // Values updated from the touch start handler
    const touchStartState: TouchStartState = {
      middleXY: [0, 0],
      distance: 0,
      clientRect: undefined,
      translateXY: [0, 0],
      scaleFactor: 1,
      scalingOffset: [0, 0],
      transformOriginXY: [0, 0],
    };

    // Values updated from the touch move handler
    const touchMoveState: TouchMoveState = {
      scaleFactor: 1,
      translateXY: [0, 0],
    };

    const {
      onTouchStart = mutateStateDefault.onTouchStart,
      onTouchMove = mutateStateDefault.onTouchMove,
    } =
      typeof options === "function"
        ? options({
            touchStartState,
            touchMoveState,
          })
        : options;

    function handleTouchMove(event: TouchEvent) {
      preventDefault(event);
      const startDistance = touchStartState.distance;
      const startMiddleXY = touchStartState.middleXY;
      const startScaleFactor = touchStartState.scaleFactor;

      // Derive some basic metrics
      const xy1 = touchToXY(event.touches[0]);
      const xy2 = touchToXY(event.touches[1] || event.touches[0]);
      const middleXY = getMiddleXY(xy1, xy2);

      // Derive scale factor
      const distance = getDistance(xy1, xy2);
      const scaleFactor =
        startDistance > 0
          ? (startScaleFactor * distance) / startDistance
          : touchMoveState.scaleFactor;

      // Derive translate
      const translateXY = addXY(
        subXY(middleXY, startMiddleXY),
        touchStartState.translateXY
      );

      // Export work to the outside
      touchMoveState.scaleFactor = scaleFactor;
      touchMoveState.translateXY = translateXY;
      if (onTouchMove(event) !== false) {
        applyTransform(touchMoveState.translateXY, touchMoveState.scaleFactor);
      }
    }
    function handleTouchStart(event: TouchEvent) {
      preventDefault(event);

      const { scaleFactor } = touchMoveState;

      // Derive some basic metrics
      const xy1 = touchToXY(event.touches[0] || event.changedTouches[0]);
      const xy2 = event.touches[1] && touchToXY(event.touches[1]);

      let middleXY, distance;
      if (xy2) {
        middleXY = getMiddleXY(xy1, xy2);
        distance = getDistance(xy1, xy2);
      } else {
        middleXY = xy1;
        distance = 0;
      }

      // Derive target element position relative to the view port
      const clientRect = element.getBoundingClientRect();
      const positionXY: XY = [clientRect.x, clientRect.y];

      // Derive transform origin
      const transformOriginXY = divXY(subXY(middleXY, positionXY), scaleFactor);

      // Derive translate
      //   prevPosition = newPosition
      //   prevPosition = prevTranslateXY + prevScalingOffset
      //   newPosition = newTranslateXY + newScalingOffset
      //   ∴ newTranslateXY = prevTranslateXY + prevScalingOffset - newScalingOffset
      const scalingOffset = mulXY(transformOriginXY, 1 - scaleFactor);
      const prevScalingOffset = mulXY(
        touchStartState.transformOriginXY,
        1 - scaleFactor
      );
      const prevTranslateXY = touchMoveState.translateXY;
      const translateXY = subXY(
        addXY(prevTranslateXY, prevScalingOffset),
        scalingOffset
      );

      // Export work to the outside
      touchStartState.scaleFactor = scaleFactor;
      touchStartState.scalingOffset = scalingOffset;
      touchStartState.middleXY = middleXY;
      touchStartState.distance = distance;
      touchStartState.clientRect = clientRect;
      touchStartState.translateXY = translateXY;
      touchStartState.transformOriginXY = transformOriginXY;
      if (onTouchStart(event) !== false) {
        applyTransform(
          touchStartState.translateXY,
          touchStartState.scaleFactor
        );
        applyTransformOrigin(touchStartState.transformOriginXY);
      }
      touchMoveState.translateXY = touchStartState.translateXY;
      touchMoveState.scaleFactor = touchStartState.scaleFactor;
    }
    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    element.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    element.addEventListener("touchend", handleTouchStart, {
      passive: false,
    });
    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchStart);
    };
  }, [elementRef, options]);
}
