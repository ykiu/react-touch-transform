import clsx from "clsx";
import { FC } from "react";
import styles from "./Demo.module.css";

export interface DemoProps {
  className?: string;
}

const Demo: FC<DemoProps> = ({ className, children }) => {
  return <div className={clsx(styles.root, className)}>{children}</div>;
};

export default Demo;
