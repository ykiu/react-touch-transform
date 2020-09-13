import styles from './Sidenav.module.css';
import XIcon from '../icons/x.svg';
import IconButton from './IconButton';

export interface SidenavProps {
  onClose: () => void;
}

export default function Sidenav(props: SidenavProps) {
  return <aside className={styles.root}>
    <IconButton onClick={props.onClose}><XIcon /></IconButton>
    <div className={styles.menu}
    >
      <h2 className={styles.heading}>Introduction</h2>
      <h2 className={styles.heading}>Examples</h2>
      <h3 className={styles.subheading}>Simple Carousel</h3>
      <h3 className={styles.subheading}>Full Screen Carousel</h3>
      <h3 className={styles.subheading}>Side Navigation</h3>
      <h3 className={styles.subheading}>Google Maps Clone</h3>
      <h2 className={styles.heading}>API Reference</h2>
      <h3 className={styles.subheading}><code>usePan()</code></h3>
      <h3 className={styles.subheading}><code>usePinchPan()</code></h3>
      <h3 className={styles.subheading}><code>useCarousel()</code></h3>
      <h3 className={styles.subheading}><code>useCarouselItem()</code></h3>
    </div>
  </aside>
}