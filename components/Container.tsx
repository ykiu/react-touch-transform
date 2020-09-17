import clsx from "clsx";
import { FC } from "react";
import styles from "./Container.module.css";

export interface ContainerProps {
  className?: string;
}

const Container: FC<ContainerProps> = ({ className, children }) => {
  return <div className={clsx(styles.root, className)}>{children}</div>;
};

export default Container;
