import React, { memo } from 'react';
import { DiagramHours } from '../../utils/constants';
import { padStart } from '../../utils/commonUtils';
import './DiagramBackground.css';

const DiagramBackground = memo(({ width, height, linesStationsForBackground, textSpacingFactor }) => {
    return (
        <>
            {/* 1. Draw Time Grid (Vertical Lines) */}
            {DiagramHours.map((hour, i) => {
                const x = 50 + i * 1200;
                const hourText = padStart(hour.toString(), 2, "0") + "00";
                
                return (
                    <g key={`hour-${i}`}>
                        {/* Hour Line */}
                        <line x1={x} y1={50} x2={x} y2={height} className="hour_line" />
                        
                        {/* Hour Text (Repeated vertically) */}
                        {Array.from({ length: Math.ceil(height / textSpacingFactor) }).map((_, j) => (
                            <text key={`ht-${i}-${j}`} x={x} y={50 + j * textSpacingFactor + 30} className="hour_text">
                                {hourText}
                            </text>
                        ))}

                        {/* 10-min Lines */}
                        {i !== DiagramHours.length - 1 && [1, 2, 3, 4, 5].map(j => {
                            const mx = x + j * 200;
                            const is30 = j === 3;
                            return (
                                <g key={`min-${i}-${j}`}>
                                    <line 
                                        x1={mx} y1={50} x2={mx} y2={height} 
                                        className={is30 ? "min30_line" : "min10_line"} 
                                    />
                                    {/* Min Text */}
                                    {Array.from({ length: Math.ceil(height / textSpacingFactor) }).map((_, k) => (
                                        <text key={`mt-${i}-${j}-${k}`} x={mx} y={50 + k * textSpacingFactor + 30} className="hour_text" fontSize="10">
                                            {j * 10}
                                        </text>
                                    ))}
                                </g>
                            );
                        })}
                    </g>
                );
            })}

            {/* 2. Draw Station Grid (Horizontal Lines) */}
            {linesStationsForBackground.map((station, i) => {
                const y = station.SVGYAXIS + 50;
                const isService = station.ID !== 'NA';
                
                return (
                    <g key={`st-${i}`}>
                        <line 
                            x1={50} y1={y} x2={width - 50} y2={y} 
                            className={isService ? "station_line" : "station_noserv_line"} 
                        />
                        {/* Station Text (Repeated horizontally) */}
                        {Array.from({ length: 31 }).map((_, j) => (
                            <text key={`stt-${i}-${j}`} x={5 + j * 1200} y={y - 5} className="station_text">
                                {station.DSC}
                            </text>
                        ))}
                    </g>
                );
            })}
        </>
    );
});

export default DiagramBackground;
