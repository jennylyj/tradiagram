import React, { useState, useEffect } from 'react';
import { DiagramHours } from '../../utils/constants';

const CurrentTimeLine = ({ height }) => {
    const [nowX, setNowX] = useState(null);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            let h = now.getHours();
            let m = now.getMinutes();
            let s = now.getSeconds();
            
            // Handle "next day" logic for early morning hours if diagram starts at 4
            if (h < DiagramHours[0]) {
                h += 24;
            }
            
            const totalMinutes = h * 60 + m + s / 60;
            const startMinutes = DiagramHours[0] * 60;
            const diffMinutes = totalMinutes - startMinutes;
            
            // 1 hour = 1200px => 1 min = 20px
            setNowX(diffMinutes * 20 + 50);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000); // Update every second
        return () => clearInterval(interval);
    }, []);

    if (nowX === null) return null;

    return (
        <line 
            x1={nowX} y1={50} x2={nowX} y2={height} 
            stroke="red" 
            strokeWidth="2" 
            strokeDasharray="5,5" 
            style={{ pointerEvents: 'none' }}
        />
    );
};

export default CurrentTimeLine;
