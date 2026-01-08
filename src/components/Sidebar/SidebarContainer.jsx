import React, { useState } from 'react';
import HamburgerButton from './HamburgerButton';
import SidebarDrawer from './SidebarDrawer';
import MobileSidebar from './MobileSidebar';

const SidebarContainer = ({ 
  currentDate, 
  onDateSelect,
  availableTrains,
  selectedTrainNos,
  onToggleTrainSelection,
  onClearTrainSelection
}) => {
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
        availableTrains={availableTrains}
        selectedTrainNos={selectedTrainNos}
        onToggleTrainSelection={onToggleTrainSelection}
        onClearTrainSelection={onClearTrainSelection}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar 
        currentDate={currentDate} 
        onDateSelect={handleDateSelect} 
        availableTrains={availableTrains}
        selectedTrainNos={selectedTrainNos}
        onToggleTrainSelection={onToggleTrainSelection}
        onClearTrainSelection={onClearTrainSelection}
      />
    </>
  );
};


export default SidebarContainer;
 