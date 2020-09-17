import clsx from "clsx";
import { FC } from "react";
import styles from "./StyledText.module.css";

export interface StyledTextProps {
  className?: string;
}

const StyledText: FC<StyledTextProps> = ({ className, children }) => {
  return <div className={clsx(styles.root, className)}>{children}</div>;
};

export default StyledText;
