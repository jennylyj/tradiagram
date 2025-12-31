import React from 'react';
import styles from './Sidebar.module.css';

const HamburgerButton = ({ isOpen, onClick }) => {
  return (
    <button 
      className={`${styles.hamburger} ${isOpen ? styles.open : ''}`} 
      onClick={onClick}
      aria-label="Toggle Menu"
    >
      <div className={styles.bar}></div>
      <div className={styles.bar}></div>
      <div className={styles.bar}></div>
    </button>
  );
};

export default HamburgerButton;
