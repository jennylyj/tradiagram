
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DiagramView from '../components/DiagramView';
import { getTodayFormattedDate } from '../utils/commonUtils';
import styles from './HomePage.module.css';
import SelectionModal from '../components/SelectionModal';

export default function HomePage() {
    const today = getTodayFormattedDate('nodash');
    const navigate = useNavigate();
    
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState('date'); // 'date' or 'region'
    const [selectedDate, setSelectedDate] = useState(today);

    const handleStartClick = (e) => {
        e.preventDefault();
        setShowModal(true);
        setModalStep('date');
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setModalStep('region');
    };

    const handleRegionSelect = (region) => {
        setShowModal(false);
        navigate(`/diagram/${region}?date=${selectedDate}`);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className={styles.container}>
            {/* 背景：使用靜態 SVG 圖片 */}
            <div className={styles.background}>
                <img src={`${import.meta.env.BASE_URL}images/home-bg.svg`} alt="Background Diagram" className={styles.bgImage} />
            </div>

            {/* 毛玻璃遮罩層 */}
            <div className={styles.overlay}>
                <div className={styles.contentBox}>
                    <h1 className={styles.title}>台灣鐵路運行圖</h1>
                    <p className={styles.subtitle}>
                        探索台灣鐵路運行圖，即時掌握列車運行狀況。<br />
                        數據更新：{today.slice(0, 4)}-{today.slice(4, 6)}-{today.slice(6, 8)}<br />
                        <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                            （資料來源：台灣鐵路管理局 Open Data 平台）
                        </span>
                    </p>
                    
                    <div className={styles.buttonGroup}>
                        <button 
                            onClick={handleStartClick} 
                            className={styles.primaryButton}
                            style={{ border: 'none', cursor: 'pointer' }}
                        >
                            出發
                        </button>
                    </div>
                </div>
            </div>

            <SelectionModal 
                isOpen={showModal}
                onClose={handleCloseModal}
                step={modalStep}
                currentDate={selectedDate}
                onDateSelect={handleDateSelect}
                onRegionSelect={handleRegionSelect}
            />
        </div>
    );
}
