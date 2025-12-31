import React from 'react';
import styles from '../Sidebar.module.css';

const CollapsibleSection = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className={styles.section}>
      <button 
        className={styles.sectionHeader} 
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className={styles.sectionTitle}>{title}</span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
          ▼
        </span>
      </button>
      <div className={`${styles.sectionContent} ${isOpen ? styles.contentOpen : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSection;
