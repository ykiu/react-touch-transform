import { FC, useCallback, useState } from "react";
import MenuButton from "./MenuButton";
import Sidenav from "./Sidenav";

export type LayoutProps = unknown;

const Layout: FC<LayoutProps> = ({ children }) => {
  const [navOpen, setNavOpen] = useState(false);
  const toggleNav = useCallback(() => setNavOpen((curr) => !curr), []);
  return (
    <div>
      <MenuButton onClick={toggleNav} />
      {navOpen && <Sidenav onClose={toggleNav} />}
      {children}
    </div>
  );
};

export default Layout;
