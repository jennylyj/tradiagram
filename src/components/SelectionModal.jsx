import React from 'react';
import styles from './SelectionModal.module.css';
import CalendarSection from './Sidebar/Sections/CalendarSection';
import RegionSection from './Sidebar/Sections/RegionSection';

const SelectionModal = ({ isOpen, onClose, step, onDateSelect, onRegionSelect, currentDate }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>
                {step === 'date' && (
                    <div className={styles.sectionContainer}>
                        <h2>選擇日期</h2>
                        <CalendarSection currentDate={currentDate} onDateSelect={onDateSelect} />
                    </div>
                )}
                {step === 'region' && (
                    <div className={styles.sectionContainer}>
                        <h2>選擇地區</h2>
                        <RegionSection onSelect={onRegionSelect} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectionModal;
