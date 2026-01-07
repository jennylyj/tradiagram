import React from 'react';
import styles from '../Sidebar.module.css';
import { LuExternalLink } from "react-icons/lu";

const ExtLinkSection = () => {
  return (
    <div className={styles.extLinks}>
      <a href="https://railway.chienwen.net/taiwan/list/overview" target="_blank" rel="noopener noreferrer">臺鐵列車動態列表 </a>
      <LuExternalLink color="#666" strokeWidth={3} />
    </div>
  );
};

export default ExtLinkSection;
