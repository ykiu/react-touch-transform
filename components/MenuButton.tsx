import styles from "./MenuButton.module.css";
import MenuIcon from "../icons/menu.svg";
import IconButton from "./IconButton";
import { FC } from "react";

export interface MenuButtonProps {
  onClick: () => void;
}

const MenuButton: FC<MenuButtonProps> = (props) => {
  return (
    <header className={styles.root}>
      <IconButton onClick={props.onClick}>
        <MenuIcon />
      </IconButton>
    </header>
  );
};

export default MenuButton;
