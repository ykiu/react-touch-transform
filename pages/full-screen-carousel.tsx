import { FC } from "react";
import styles from "./full-screen-carousel.module.css";
import Head from "next/head";
import FullScreenCarouselDemo from "../examples/FullScreenCarousel";
import Demo from "../components/Demo";
import { promises as fs } from "fs";
import highlight from "../utils/highlight";
import Code from "../components/Code";
import TextPageLayout from "../components/TextPageLayout";

export interface FullScreenCarouselProps {
  children?: never;
  code: string;
}

export async function getStaticProps(): Promise<{
  props: FullScreenCarouselProps;
}> {
  const code = await fs.readFile("examples/Carousel.js", "utf-8");
  return {
    props: { code: highlight(code) },
  };
}

const FullScreenCarousel: FC<FullScreenCarouselProps> = ({ code }) => {
  return (
    <TextPageLayout>
      <Head>
        <title>Full Screen Carousel</title>
      </Head>
      <h1>Full Screen Carousel</h1>
      <p>
        Implement a carousel with <code>useCarouselItem()</code> and{" "}
        <code>useCarouselContainer()</code>.
      </p>
      <p>Note: the demo works only on touch devices.</p>
      <Demo className={styles.demo}>
        <FullScreenCarouselDemo className={styles.carousel} />
      </Demo>
      <Code dangerouslySetInnerHTML={{ __html: code }} />
    </TextPageLayout>
  );
};

export default FullScreenCarousel;
