import { FC, HTMLAttributes } from "react";
import Container from "./Container";
import Layout from "./Layout";
import StyledText from "./StyledText";
import styles from "./TextPageLayout.module.css";

export type TextPageLayoutProps = HTMLAttributes<HTMLElement>;

const TextPageLayout: FC<TextPageLayoutProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <Layout className={className} {...rest}>
      <main className={styles.main}>
        <Container>
          <StyledText>{children}</StyledText>
        </Container>
      </main>
    </Layout>
  );
};

export default TextPageLayout;
