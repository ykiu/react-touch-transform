import Head from "next/head";
import styles from "./index.module.css";
import { FC } from "react";
import packageJson from "../package.json";
import Layout from "../components/Layout";
import Container from "../components/Container";

export interface ReactTouchTransformProps {
  children?: never;
}

const ReactTouchTransform: FC<ReactTouchTransformProps> = () => {
  return (
    <Layout>
      <Head>
        <title>React Touch Tranform</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>React Touch Transform</h1>
        <p className={styles.shortDescription}>
          CSS transforms for touch gestures{" "}
          <span role="img" aria-label="Swipe Emoji">
            ⁽⁽👆⁾⁾
          </span>
        </p>
        <code className={styles.commandLine}>
          <pre>
            npm install{" "}
            <span className={styles.commandLineHeighlight}>
              {packageJson.name}
            </span>
          </pre>
        </code>
        <img
          src="/images/carousel.gif"
          alt="Screen capture of a carousel created with React Touch Transform"
          width={220}
          height={403}
          className={styles.gif}
        />
        <Container>
          <section className={styles.section}>
            <header>
              <h2 className={styles.heading}>Features</h2>
            </header>
            <ul className={styles.ul}>
              <li>___ kib gzipped</li>
              <li>60fps</li>
              <li>Customizable</li>
              <li>Zero Dependencies</li>
            </ul>
          </section>
        </Container>
      </main>

      {/* <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer> */}
    </Layout>
  );
};

export default ReactTouchTransform;
