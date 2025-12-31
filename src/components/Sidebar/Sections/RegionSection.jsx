import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { LineDict } from '../../../utils/constants';
import styles from '../Sidebar.module.css';

const RegionSection = ({ onSelect, selectedRegion }) => {
  const { lineKind } = useParams();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const currentRegion = selectedRegion || lineKind;

  const getLinkTo = (key) => {
      if (dateParam) {
          return `/diagram/${key}?date=${dateParam}`;
      }
      return `/diagram/${key}`;
  };

  return (
    <div className={styles.regionGrid}>
      {Object.entries(LineDict).map(([key, name]) => (
        onSelect ? (
            <div
                key={key}
                className={`${styles.regionButton} ${currentRegion === key ? styles.activeRegion : ''}`}
                onClick={() => onSelect(key)}
                style={{ cursor: 'pointer' }}
            >
                {name}
            </div>
        ) : (
            <Link
            key={key}
            to={getLinkTo(key)}
            className={`${styles.regionButton} ${currentRegion === key ? styles.activeRegion : ''}`}
            >
            {name}
            </Link>
        )
      ))}
    </div>
  );
};

export default RegionSection;
