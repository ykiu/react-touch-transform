import { FC, ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./IconButton.module.css";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const IconButton: FC<IconButtonProps> = ({ className, children, ...rest }) => {
  return (
    <button className={clsx(styles.root, className)} {...rest}>
      {children}
    </button>
  );
};

export default IconButton;
