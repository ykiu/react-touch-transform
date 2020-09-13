import styles from './MenuButton.module.css';
import MenuIcon from '../icons/menu.svg';
import IconButton from './IconButton';

export interface MenuButtonProps {
  onClick: () => void;
}

export default function MenuButton(props) {
  return <header
    className={styles.root}
  ><IconButton onClick={props.onClick}><MenuIcon /></IconButton></header>
}
