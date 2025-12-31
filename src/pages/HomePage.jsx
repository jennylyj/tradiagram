
import React from 'react';
import { Link } from 'react-router-dom';
import DiagramView from '../components/DiagramView';
import { getTodayFormattedDate } from '../utils/commonUtils';
import styles from './HomePage.module.css';

export default function HomePage() {
    const today = getTodayFormattedDate('nodash');

    return (
        <div className={styles.container}>
            {/* 背景：使用靜態 SVG 圖片 */}
            <div className={styles.background}>
                <img src="/images/home-bg.svg" alt="Background Diagram" className={styles.bgImage} />
            </div>

            {/* 毛玻璃遮罩層 */}
            <div className={styles.overlay}>
                <div className={styles.contentBox}>
                    <h1 className={styles.title}>TraDiagram</h1>
                    <p className={styles.subtitle}>
                        探索台灣鐵路運行圖，即時掌握列車運行狀況。<br />
                        <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                            數據更新日期：{today.slice(0, 4)}-{today.slice(4, 6)}-{today.slice(6, 8)}
                        </span>
                    </p>
                    
                    <div className={styles.buttonGroup}>
                        <Link to="/diagram/LINE_WN" className={styles.primaryButton}>
                            開始探索
                        </Link>
                        <Link to="/diagram/LINE_I" className={styles.secondaryButton}>
                            宜蘭線
                        </Link>
                        <Link to="/diagram/LINE_T" className={styles.secondaryButton}>
                            台東線
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
