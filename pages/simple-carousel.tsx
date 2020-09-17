import { FC } from "react";
import Carousel from "../examples/Carousel";
import Layout from "../components/Layout";
import styles from "./simple-carousel.module.css";
import Head from "next/head";
import Container from "../components/Container";
import StyledText from "../components/StyledText";
import Demo from "../components/Demo";

export interface SimpleCarouselProps {
  children?: never;
}

const SimpleCarousel: FC<SimpleCarouselProps> = () => {
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
          </StyledText>
        </Container>
      </main>
    </Layout>
  );
};

export default SimpleCarousel;
