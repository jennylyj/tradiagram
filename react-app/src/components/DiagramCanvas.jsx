import React, { useMemo } from 'react';
import { DiagramHours } from '../utils/constants';
import { padStart } from '../utils/commonUtils';

export default function DiagramCanvas({ trainsData, lineKind, linesStationsForBackground, carKind }) {
    // Constants for drawing
    const hourWidth = 1200;
    const width = hourWidth * (DiagramHours.length - 1) + 100;
    const height = linesStationsForBackground ? linesStationsForBackground[linesStationsForBackground.length - 1].SVGYAXIS + 100 : 800;
    const textSpacingFactor = 500;

    // Helper to find stations that need stop (terminal stations)
    const diagramNeedStop = useMemo(() => {
        if (!linesStationsForBackground) return [];
        return linesStationsForBackground
            .filter(item => item.TERMINAL === 'Y')
            .map(item => item.ID);
    }, [linesStationsForBackground]);

    // Helper to generate path string and coordinates
    const generatePathData = (value, trainKind) => {
        let path = "M";
        let coordinates = [];
        
        for (const [dsc, id, time, loc, stop, order] of value) {
            let x = time * 10 - 1200 * DiagramHours[0] + 50;
            let y = loc + 50;
            x = Math.round((x + Number.EPSILON) * 100) / 100;
            y = Math.round((y + Number.EPSILON) * 100) / 100;
            
            if (stop !== -1 || diagramNeedStop.includes(id)) {
                path += `${x},${y} `;
                coordinates.push([x, y]);
            }
        }
        return { pathString: path.trim(), coordinates };
    };

    // Process trains data for rendering
    const renderTrains = useMemo(() => {
        if (!trainsData || !carKind) return [];

        const renderedPaths = [];

        trainsData.forEach(trainGroup => {
            trainGroup.forEach(([lKind, trainNo, trainKind, line, lineDir, value]) => {
                if (lKind !== lineKind) return;
                if (value.length <= 2) return;

                // Simple logic for now: treat as one continuous path if possible
                // In original code, it splits uncontinuous paths. 
                // For React MVP, let's try rendering the whole path first or split if needed.
                // To keep it simple and robust, let's just render the whole value array for now
                // unless we strictly need to split like the original code.
                
                // Let's implement the split logic to be safe
                let order_next = value[0][5];
                let splitIndex = 0;
                for (const [dsc, id, time, loc, stop, order] of value) {
                    if (order == order_next) {
                        order_next += 1;
                        splitIndex += 1;
                    } else {
                        break;
                    }
                }

                const sections = [];
                if (splitIndex < value.length) {
                    sections.push(value.slice(0, splitIndex));
                    sections.push(value.slice(splitIndex));
                } else {
                    sections.push(value);
                }

                sections.forEach((section, idx) => {
                    if (section.length <= 1) return;
                    
                    const { pathString } = generatePathData(section, trainKind);
                    const styleClass = carKind[trainKind] || "others";
                    const uniqueId = `${lineKind}-${trainNo}-${idx}`;

                    renderedPaths.push(
                        <g key={uniqueId}>
                            <path
                                d={pathString}
                                className={styleClass}
                                id={uniqueId}
                                fill="none"
                                strokeWidth="2" // Default, CSS can override
                            />
                            {/* Text on path logic is complex in pure SVG/React without a library.
                                For MVP, we can use a simple text at the start or middle.
                                Or implement <textPath> if strictly needed.
                            */}
                            <text dy="-3">
                                <textPath href={`#${uniqueId}`} startOffset="50%">
                                    {trainNo}
                                </textPath>
                            </text>
                        </g>
                    );
                });
            });
        });

        return renderedPaths;
    }, [trainsData, lineKind, diagramNeedStop, carKind]);


    if (!linesStationsForBackground) return <div>Loading Background...</div>;

    return (
        <div style={{ overflow: 'auto', width: '100%', height: '100vh' }}>
            <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
                <style>
                    {`
                        .hour_line { stroke: #ccc; stroke-width: 1; }
                        .min10_line { stroke: #eee; stroke-width: 1; }
                        .min30_line { stroke: #ddd; stroke-width: 1; }
                        .station_line { stroke: #ccc; stroke-width: 1; }
                        .station_noserv_line { stroke: #eee; stroke-width: 1; stroke-dasharray: 5,5; }
                        .hour_text { font-size: 12px; fill: #666; }
                        .station_text { font-size: 12px; fill: #666; }
                        
                        /* Train Styles from CSS */
                        .taroko, .kuaimu { stroke: #20b2aa; stroke-width: 2; }
                        .puyuma, .zhongxing, .direct { stroke: red; stroke-width: 2; }
                        .tze_chiang, .alishan_local { stroke: orange; stroke-width: 2; }
                        .tze_chiang_diesel { stroke: gold; stroke-width: 2; }
                        .emu1200 { stroke: #ff008c; stroke-width: 2; }
                        .emu300 { stroke: #f44; stroke-width: 2; }
                        .emu3000 { stroke: #000; stroke-width: 2; }
                        .chu_kuang, .chushan1, .chushan2, .skip_stop { stroke: #faab82; stroke-width: 2; }
                        .local, .alishan, .all_stop { stroke: #00f; stroke-width: 1.5; }
                        .local_express { stroke: #00a6ff; stroke-width: 1.5; }
                        .fu_hsing { stroke: #00bfff; stroke-width: 1.5; }
                        .ordinary, .theme { stroke: #006055; stroke-width: 1.5; }
                        .special { stroke: #ff1493; stroke-width: 2; }
                        .others { stroke: grey; stroke-width: 1; }
                    `}
                </style>

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

                {/* 3. Draw Trains */}
                {renderTrains}

            </svg>
        </div>
    );
}
