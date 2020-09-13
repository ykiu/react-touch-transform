import Head from 'next/head'
import styles from './react-touch-transform.module.css'
import MenuButton from '../components/MenuButton'
import Sidenav from '../components/Sidenav'
import { useState } from 'react'
import packageJson from '../package.json';

export default function ReactTouchTransform() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className={styles.container}>
      <Head>
        <title>React Touch Tranform</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MenuButton onClick={() => setNavOpen(true)} />
      {navOpen && <Sidenav onClose={() => setNavOpen(false)} />}
      <main className={styles.main}>
        <h1 className={styles.title}>
          React Touch Transform
        </h1>
        <p className={styles.shortDescription}>CSS transforms for touch gestures ⁽⁽👆⁾⁾</p>
        <code className={styles.commandLine}>
          <pre>
            npm install <span className={styles.commandLineHeighlight}>{packageJson.name}</span>
          </pre>
        </code>
        <img src="/images/carousel.gif" width={220} height={403} className={styles.gif} />
        <section className={styles.section}>
          <header>
            <h2 className={styles.heading}>
              Features
            </h2>
          </header>
          <ul className={styles.ul}>
            <li>___ kib gzipped</li>
            <li>60fps</li>
            <li>Customizable</li>
          </ul>
        </section>
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
    </div>
  )
}
