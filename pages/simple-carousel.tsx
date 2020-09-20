import { FC } from "react";
import Carousel from "../examples/Carousel";
import Layout from "../components/Layout";
import styles from "./simple-carousel.module.css";
import Head from "next/head";
import Container from "../components/Container";
import StyledText from "../components/StyledText";
import Demo from "../components/Demo";
import { promises as fs } from "fs";
import highlight from "../utils/highlight";
import Code from "../components/Code";

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
    <Layout>
      <Head>
        <title>Simple Carousel</title>
      </Head>
      <main className={styles.main}>
        <Container>
          <StyledText>
            <h1>Simple Carousel</h1>
            <p>A simple but full-fledged carousel component.</p>
            <p>
              Implement a beautiful carousel with the <code>useCarousel()</code>{" "}
              react hook.
            </p>
            <Demo className={styles.demo}>
              <Carousel className={styles.carousel} />
            </Demo>
            <Code dangerouslySetInnerHTML={{ __html: code }} />
          </StyledText>
        </Container>
      </main>
    </Layout>
  );
};

export default SimpleCarousel;
