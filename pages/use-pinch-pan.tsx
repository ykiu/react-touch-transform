import { FC } from "react";
import Carousel from "../examples/Carousel";
import styles from "./simple-carousel.module.css";
import Head from "next/head";
import Demo from "../components/Demo";
import { promises as fs } from "fs";
import highlight from "../utils/highlight";
import Code from "../components/Code";
import TextPageLayout from "../components/TextPageLayout";

export interface SimpleCarouselProps {
  children?: never;
  code: string;
}

export async function getStaticProps(): Promise<{
  props: SimpleCarouselProps;
}> {
  const code = await fs.readFile("examples/Carousel.js", "utf-8");
  return {
    props: { code: highlight(code) },
  };
}

const SimpleCarousel: FC<SimpleCarouselProps> = ({ code }) => {
  return (
    <TextPageLayout>
      <Head>
        <title>usePinchPan() React Hook</title>
      </Head>
      <h1>
        <code>usePinchPan(ref, [options]) =&gt; void</code>
      </h1>
      <p>
        usePinchPan() listens for touch events to scale and move around the
        target element.
      </p>
      <p>
        usePinchPan() is a primitive in this library. You may be more interested
        in higher-level APIs like useCarousel().
      </p>
      <h2>Arguments</h2>
      <ol>
        <li>
          <code>ref</code>: A React ref to the target element.
        </li>
        <li>
          <code>options</code> (<em>Object</em> [optional]):
          <ul>
            <li>
              <code>options.makeHandlers</code> (<em>Function</em> [optional]):
              A function returning touch event handlers.
            </li>
          </ul>
        </li>
      </ol>
      <h2>Returns</h2>
      <p>None.</p>
      <h2>
        <code>options.makeHandlers</code>
      </h2>
      <p>
        You can provide a function named <code>makeHandlers</code> to do some
        extra things with touch events. Your function receives two objects
        holding information about the current/past status of the target element:{" "}
      </p>
      <ul>
        <li>
          <code>touchStartState</code> (Object): Stores the position and the
          size of the target element when the touch started and
        </li>
        <li>
          <code>touchMoveState</code> (Object): Stores the current position and
          size of the target element.
        </li>
      </ul>
      <p>And should return a object with the following properties:</p>
      <ul>
        <li>
          <code>onTouchStart</code> (Function): Invoked when a touchstart or a
          touchend event is detected.
        </li>
        <li>
          <code>onTouchEnd</code> (Function): Invoked when a touchmove event is
          detected.
        </li>
      </ul>
      <p>
        An invokation of usePinchPan() should look like the following with the
        makeHandlers() option:
      </p>
      <Code
        dangerouslySetInnerHTML={{
          __html: `
usePinchPan(ref, {
  makeHandlers: ({
    touchStartState,
    touchMoveState,
  }) => ({
    onTouchStart: (event) => {
      // Do something with the touch event.
    },
    onTouchMove: (event) => {
      // Do something with the touch event.
    },
    
  })
})
      `.trim(),
        }}
      />
      <h3>
        <code>touchStartState</code> and <code>touchMoveState</code>
      </h3>
      <p>
        <code>touchStartState</code> and <code>touchMoveState</code> are{" "}
        <em>mutable</em> containers that manage information needed for pinch/pan
        gestures. They have the following properties:
      </p>
      <h4>
        <code>touchStartState</code>
      </h4>
      <ul>
        <li>
          <code>middleXY</code> ([number, number]): The coordinates of the
          middle point when there are two touch points. If there is only one
          touch point, falls back to the coordinates of that touch point.
        </li>
        <li>
          <code>distance</code> (number): The distance between two touch points.
          If there is only one touch point, falls back to 0.
        </li>
        <li>
          <code>clientRect</code> (DOMRect): The return value of
          <code>targetElement.getBoundingClientRect()</code>.
        </li>
        <li>
          <code>translateXY</code> ([number, number]): The arguments to the CSS
          translate() function applied.
        </li>
        <li>
          <code>scaleFactor</code> (number): The argument to the CSS scale()
          function applied.
        </li>
        <li>
          <code>transformOriginXY</code> ([number, number]): The values of the
          CSS transform-origin property.
        </li>
        <li>
          <code>scalingOffset</code> ([number, number]): The offset of the top
          left corner due to scaling.
        </li>
      </ul>
      <p>
        The properties of <code>touchStartState</code> get refreshed only when a
        new touch point emerged (including when a touch simply started) and when
        a touch point vanished (including when a touch simply ended). They never
        change during touch move.
      </p>
      <h4>
        <code>touchMoveState</code>
      </h4>
      <ul>
        <li>
          <code>scaleFactor</code> (number): The argument to the CSS scale()
          function applied.
        </li>
        <li>
          <code>translateXY</code> ([number, number]): The arguments to the CSS
          translate() function applied.
        </li>
      </ul>
      <p>
        As opposed to <code>touchStartState</code>, the properties of
        touchMoveState get refreshed on every touchmove event. Thus, they
        represent the current status of the target element.
      </p>
      <h3>
        Overriding the default behaviour with <code>makeHandlers()</code>
      </h3>
      <p>
        You can override the default behaviour of <code>usePinchPan()</code> by
        assigning values to <code>touchStartState</code> and{" "}
        <code>touchMoveState</code> from inside <code>onTouchStart</code> and{" "}
        <code>onTouchMove</code>, respectively.
      </p>
      <p>
        You can also prevent <code>usePinchPan()</code> from applying any styles
        by returning <code>false</code> from <code>onTouchStart</code> or{" "}
        <code>onTouchMove</code>.
      </p>
    </TextPageLayout>
  );
};

export default SimpleCarousel;
