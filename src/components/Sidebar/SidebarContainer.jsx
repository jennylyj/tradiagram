import React, { useState } from 'react';
import HamburgerButton from './HamburgerButton';
import SidebarDrawer from './SidebarDrawer';
import MobileSidebar from './MobileSidebar';

const SidebarContainer = ({ currentDate, onDateSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleDateSelect = (date) => {
    onDateSelect(date);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <HamburgerButton isOpen={isOpen} onClick={toggleSidebar} />
      <SidebarDrawer 
        isOpen={isOpen} 
        currentDate={currentDate} 
        onDateSelect={handleDateSelect}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar 
        currentDate={currentDate} 
        onDateSelect={handleDateSelect} 
      />
    </>
  );
};


export default SidebarContainer;
 