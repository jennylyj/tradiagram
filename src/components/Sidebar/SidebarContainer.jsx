import React, { useState } from 'react';
import HamburgerButton from './HamburgerButton';
import SidebarDrawer from './SidebarDrawer';

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
      <HamburgerButton isOpen={isOpen} onClick={toggleSidebar} />
      <SidebarDrawer 
        isOpen={isOpen} 
        currentDate={currentDate} 
        onDateSelect={handleDateSelect}
      />
    </>
  );
};


export default SidebarContainer;
 