import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { LineDict } from '../../../utils/constants';
import styles from '../Sidebar.module.css';

const RegionSection = () => {
  const { lineKind } = useParams();

  return (
    <div className={styles.regionGrid}>
      {Object.entries(LineDict).map(([key, name]) => (
        <Link
          key={key}
          to={`/diagram/${key}`}
          className={`${styles.regionButton} ${lineKind === key ? styles.activeRegion : ''}`}
        >
          {name}
        </Link>
      ))}
    </div>
  );
};

export default RegionSection;
