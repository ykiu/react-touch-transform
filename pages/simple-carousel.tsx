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
        <title>Simple Carousel</title>
      </Head>
      <h1>Simple Carousel</h1>
      <p>
        Implement a carousel with <code>useCarouselItem()</code> and{" "}
        <code>useCarouselContainer()</code>.
      </p>
      <p>Note: the demo works only on touch devices.</p>
      <Demo className={styles.demo}>
        <Carousel className={styles.carousel} />
      </Demo>
      <Code dangerouslySetInnerHTML={{ __html: code }} />
    </TextPageLayout>
  );
};

export default SimpleCarousel;
