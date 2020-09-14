import { ReactNode, HTMLAttributes, FC } from "react";
import clsx from "clsx";
import styles from "./IconButton.module.css";

export interface IconButtonProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

const IconButton: FC<IconButtonProps> = ({ className, ...rest }) => {
  return <button className={clsx(styles.root, className)} {...rest} />;
};

export default IconButton;
