import { FC, HTMLAttributes, useCallback, useState } from "react";
import MenuButton from "./MenuButton";
import Sidenav from "./Sidenav";

export type LayoutProps = HTMLAttributes<HTMLDivElement>;

const Layout: FC<LayoutProps> = ({ children, ...rest }) => {
  const [navOpen, setNavOpen] = useState(false);
  const toggleNav = useCallback(() => setNavOpen((curr) => !curr), []);
  return (
    <div {...rest}>
      {children}
      <MenuButton onClick={toggleNav} />
      {navOpen && <Sidenav onClose={toggleNav} />}
    </div>
  );
};

export default Layout;
