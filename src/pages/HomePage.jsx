
import React from 'react';
import { Link } from 'react-router-dom';
import { LineDict } from '../utils/constants';

export default function HomePage() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Taiwan Railway Diagram</h1>
            <h2>Select a Line</h2>
            <ul>
                {Object.entries(LineDict).map(([key, name]) => (
                    <li key={key}>
                        <Link to={`/diagram/${key}`}>{name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
