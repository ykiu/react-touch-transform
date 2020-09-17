import Link from "next/link";
import styles from "./Sidenav.module.css";
import XIcon from "../icons/x.svg";
import IconButton from "./IconButton";
import { FC } from "react";

export interface SidenavProps {
  onClose: () => void;
}

const Sidenav: FC<SidenavProps> = ({ onClose }) => {
  return (
    <aside className={styles.root}>
      <IconButton onClick={onClose}>
        <XIcon />
      </IconButton>
      <div className={styles.menu}>
        <h2 className={styles.heading}>
          <Link href="/">
            <a>React Touch Transform</a>
          </Link>
        </h2>
        <h2 className={styles.heading}>Examples</h2>
        <h3 className={styles.subheading}>
          <Link href="/simple-carousel">
            <a>Simple Carousel</a>
          </Link>
        </h3>
        <h3 className={styles.subheading}>Full Screen Carousel</h3>
        <h3 className={styles.subheading}>Side Navigation</h3>
        <h3 className={styles.subheading}>Google Maps Clone</h3>
        <h2 className={styles.heading}>API Reference</h2>
        <h3 className={styles.subheading}>
          <code>usePan()</code>
        </h3>
        <h3 className={styles.subheading}>
          <code>usePinchPan()</code>
        </h3>
        <h3 className={styles.subheading}>
          <code>useCarousel()</code>
        </h3>
        <h3 className={styles.subheading}>
          <code>useCarouselItem()</code>
        </h3>
      </div>
    </aside>
  );
};

export default Sidenav;
