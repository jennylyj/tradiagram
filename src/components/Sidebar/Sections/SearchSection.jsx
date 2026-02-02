import React, { useMemo, useState } from 'react';
import { useCombobox } from 'downshift';
import styles from '../Sidebar.module.css';
import { CarDict } from '../../../utils/constants';

const SearchSection = ({ availableTrains = [], selectedTrainNos = [], onToggleTrainSelection, onClearTrainSelection }) => {
  const [inputValue, setInputValue] = useState('');
  const [ignoreMouse, setIgnoreMouse] = useState(false);

  const items = useMemo(() => {
    if (!inputValue) return [];
    const safeTrains = availableTrains || [];
    const term = inputValue.toLowerCase();
    return safeTrains.filter(train => {
      const trainNo = train.trainNo.toLowerCase();
      const typeName = (CarDict[train.carTypeKey] || '').toLowerCase();
      return trainNo.startsWith(term) || typeName.includes(term);
    });
  }, [inputValue, availableTrains]);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items,
    inputValue,
    onInputValueChange: ({ inputValue }) => {
      setInputValue(inputValue);
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        onToggleTrainSelection && onToggleTrainSelection(selectedItem.trainNo);
      }
    },
    itemToString: (item) => (item ? item.trainNo : ''),
    onHighlightedIndexChange: ({ type }) => {
      if (
        type === useCombobox.stateChangeTypes.InputKeyDownArrowDown ||
        type === useCombobox.stateChangeTypes.InputKeyDownArrowUp
      ) {
        setIgnoreMouse(true);
      }
    },
    stateReducer: (state, actionAndChanges) => {
      const { type, changes } = actionAndChanges;
      if (
        type === useCombobox.stateChangeTypes.ItemClick ||
        type === useCombobox.stateChangeTypes.InputKeyDownEnter
      ) {
        return {
          ...changes,
          isOpen: true,
          highlightedIndex: state.highlightedIndex,
          inputValue: state.inputValue,
        };
      }
      return changes;
    },
  });

  return (
    <div 
      className={styles.searchSection}
      onMouseMove={() => { if (ignoreMouse) setIgnoreMouse(false); }}
    >
      <input 
        {...getInputProps({
            className: styles.searchInput,
            placeholder: "輸入車次編號或車種",
        })}
      />
    
      <ul 
        {...getMenuProps()} 
        className={styles.searchResults} 
        style={{
          display: isOpen && items.length > 0 ? 'block' : 'none',
          pointerEvents: ignoreMouse ? 'none' : 'auto'
        }}
      >
          {isOpen && items.map((item, index) => (
            <li
              key={`${item.trainNo}${index}`}
              {...getItemProps({ item, index })}
              className={`${styles.searchResultItem} ${selectedTrainNos.includes(item.trainNo) ? styles.selected : ''} ${highlightedIndex === index ? styles.active : ''}`}
            >
              {item.trainNo}
              <span style={{fontSize: '0.8em', color: '#999', marginLeft: '8px'}}>
                  {CarDict[item.carTypeKey]}
              </span>
            </li>
          ))}
      </ul>
    
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
