import React, { useState } from 'react';
import { LuCalendarDays, LuSearch, LuRoute, LuLink } from 'react-icons/lu';
import styles from './Sidebar.module.css';
import CalendarSection from './Sections/CalendarSection';
import SearchSection from './Sections/SearchSection';
import RegionSection from './Sections/RegionSection';
import ExtLinkSection from './Sections/ExtLinkSection';

const MobileSidebar = ({ currentDate, onDateSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      setActivePanel(null);
    } else {
      setIsMenuOpen(true);
    }
  };

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  return (
    <div className={styles.mobileContainer}>
      {/* Hamburger Button */}
      <button 
        className={`${styles.mobileHamburger} ${isMenuOpen ? styles.open : ''}`}
        onClick={toggleMenu}
        aria-label="選單"
      >
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </button>

      {/* Floating Menu Icons */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <button 
          className={`${styles.mobileIconBtn} ${activePanel === 'extlink' ? styles.active : ''}`}
          onClick={() => togglePanel('extlink')}
          title="連結"
        >
          <LuLink strokeWidth={3}/>
        </button>
        <button 
          className={`${styles.mobileIconBtn} ${activePanel === 'region' ? styles.active : ''}`}
          onClick={() => togglePanel('region')}
          title="路線"
        >
          <LuRoute strokeWidth={3}/>
        </button>
        <button 
          className={`${styles.mobileIconBtn} ${activePanel === 'search' ? styles.active : ''}`}
          onClick={() => togglePanel('search')}
          title="搜尋"
        >
          <LuSearch strokeWidth={3}/>
        </button>
        <button 
          className={`${styles.mobileIconBtn} ${activePanel === 'calendar' ? styles.active : ''}`}
          onClick={() => togglePanel('calendar')}
          title="日曆"
        >
          <LuCalendarDays strokeWidth={3}/>
        </button>
      </div>

      {/* Expanded Panel */}
      <div className={`${styles.mobilePanel} ${activePanel ? styles.open : ''}`}>
        <div className={styles.mobilePanelContent}>
          {activePanel === 'calendar' && (
            <>
              <h3 className={styles.mobilePanelTitle}>選擇日期</h3>
              <CalendarSection currentDate={currentDate} onDateSelect={onDateSelect} />
            </>
          )}
          {activePanel === 'search' && (
            <>
              <h3 className={styles.mobilePanelTitle}>搜尋車次</h3>
              <SearchSection />
            </>
          )}
          {activePanel === 'region' && (
            <>
              <h3 className={styles.mobilePanelTitle}>選擇路線</h3>
              <RegionSection />
            </>
          )}
          {activePanel === 'extlink' && (
            <>
              <h3 className={styles.mobilePanelTitle}>外部連結</h3>
              <ExtLinkSection />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
