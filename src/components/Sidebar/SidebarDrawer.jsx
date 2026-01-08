import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import CollapsibleSection from './Sections/CollapsibleSection';
import CalendarSection from './Sections/CalendarSection';
import RegionSection from './Sections/RegionSection';
import SearchSection from './Sections/SearchSection';
import ExtLinkSection from './Sections/ExtLinkSection';

const SidebarDrawer = ({ 
  isOpen, 
  currentDate, 
  onDateSelect,
  availableTrains,
  selectedTrainNos,
  onToggleTrainSelection,
  onClearTrainSelection
}) => {
  const [activeSection, setActiveSection] = useState('calendar');

  const toggleSection = (sectionId) => {
    setActiveSection(prev => prev === sectionId ? null : sectionId);
  };

  return (
    <aside className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
      <div className={styles.content}>
        <h2 className={styles.title}>設定</h2>
        
        <CollapsibleSection 
          title="選擇日曆" 
          isOpen={activeSection === 'calendar'}
          onToggle={() => toggleSection('calendar')}
        >
          <CalendarSection currentDate={currentDate} onDateSelect={onDateSelect} />
        </CollapsibleSection>

        <CollapsibleSection 
          title="搜尋車次"
          isOpen={activeSection === 'search'}
          onToggle={() => toggleSection('search')}
        >
          <SearchSection 
             availableTrains={availableTrains}
             selectedTrainNos={selectedTrainNos}
             onToggleTrainSelection={onToggleTrainSelection}
             onClearTrainSelection={onClearTrainSelection}
          />
        </CollapsibleSection>

        <CollapsibleSection 
          title="選擇軌道"
          isOpen={activeSection === 'region'}
          onToggle={() => toggleSection('region')}
        >
          <RegionSection />
        </CollapsibleSection>

        <CollapsibleSection 
          title="外部連結"
          isOpen={activeSection === 'extlink'}
          onToggle={() => toggleSection('extlink')}
        >
          <ExtLinkSection />
        </CollapsibleSection>

      </div>
    </aside>
  );
};

export default SidebarDrawer;
