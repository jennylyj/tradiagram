import React, { useState } from 'react';
import HamburgerButton from './HamburgerButton';
import SidebarDrawer from './SidebarDrawer';

const SidebarContainer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <HamburgerButton isOpen={isOpen} onClick={toggleSidebar} />
      <SidebarDrawer isOpen={isOpen}>
        {/* 未來可以在這裡放入更多子組件 */}
      </SidebarDrawer>
    </>
  );
};

export default SidebarContainer;
 