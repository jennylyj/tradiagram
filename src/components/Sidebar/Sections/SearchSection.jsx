import React, { useState, useMemo, useEffect, useRef } from 'react';
import styles from '../Sidebar.module.css';

const SearchSection = ({ availableTrains = [], selectedTrainNos = [], onToggleTrainSelection, onClearTrainSelection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef(null);

  const filteredTrains = useMemo(() => {
    if (!searchTerm) return [];
    const safeTrains = availableTrains || [];
    return safeTrains.filter(trainNo => trainNo.startsWith(searchTerm));
  }, [searchTerm, availableTrains]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [filteredTrains]);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[activeIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  const handleKeyDown = (e) => {
    if (filteredTrains.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredTrains.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        onToggleTrainSelection && onToggleTrainSelection(filteredTrains[activeIndex]);
      }
    }
  };

  return (
    <div className={styles.searchSection}>
      <input 
        type="text" 
        className={styles.searchInput}
        placeholder="輸入車次編號"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      
      {filteredTrains.length > 0 && (
        <ul className={styles.searchResults} ref={listRef}>
          {filteredTrains.map((trainNo, index) => (
            <li 
              key={trainNo}  
              className={`${styles.searchResultItem} ${selectedTrainNos.includes(trainNo) ? styles.selected : ''} ${index === activeIndex ? styles.active : ''}`}
              onClick={() => onToggleTrainSelection && onToggleTrainSelection(trainNo)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {trainNo}
            </li>
          ))}
        </ul>
      )}

      {selectedTrainNos.length > 0 && (
        <div className={styles.selectedTrainsContainer}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 className={styles.selectedTitle} style={{ margin: 0 }}>已選擇</h4>
              <button 
                onClick={onClearTrainSelection}
                className={styles.clearButton}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                清除全部
              </button>
           </div>
           <div className={styles.selectedTags}>
               {selectedTrainNos.map(trainNo => (
                    <button 
                         key={trainNo} 
                         className={styles.selectedTag} 
                         onClick={() => onToggleTrainSelection && onToggleTrainSelection(trainNo)}
                    >
                       {trainNo} ×
                    </button>
               ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default SearchSection;
