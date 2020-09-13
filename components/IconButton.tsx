import { ReactNode, HTMLAttributes } from "react";
import clsx from 'clsx';
import styles from './IconButton.module.css';

export interface IconButtonProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export default function IconButton({className, ...rest}: IconButtonProps) {
  return <button
  className={clsx(styles.root, className)}
  {...rest}
  />;
}