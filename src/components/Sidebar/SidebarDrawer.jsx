import React from 'react';
import styles from './Sidebar.module.css';

const SidebarDrawer = ({ isOpen, children }) => {
  return (
    <aside className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
      <div className={styles.content}>
        <h2 className={styles.title}>運行圖控制面板</h2>
        {children}
        
        {/* 預留的工具列表位置 */}
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          <p>• 線路選擇 (待開發)</p>
          <p>• 縮放倍率 (待開發)</p>
          <p>• 車次過濾 (待開發)</p>
        </div>
      </div>
    </aside>
  );
};

export default SidebarDrawer;
