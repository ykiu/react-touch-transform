import clsx from "clsx";
import { FC, HTMLAttributes } from "react";
import styles from "./Code.module.css";
import highlightStyles from "../utils/highlight.module.css";

export interface CodeProps extends HTMLAttributes<HTMLPreElement> {
  children?: never;
}

const Code: FC<CodeProps> = ({
  className,
  dangerouslySetInnerHTML,
  ...rest
}) => {
  return (
    <pre
      className={clsx(styles.root, highlightStyles.background, className)}
      {...rest}
    >
      <code
        className={styles.code}
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      />
    </pre>
  );
};

export default Code;
