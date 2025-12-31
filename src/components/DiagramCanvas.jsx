import React, { useMemo, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import FloatingStationLabels from './FloatingStationLabels';
import { DiagramHours } from '../utils/constants';
import { padStart } from '../utils/commonUtils';

// Helper functions for text positioning
function calculateDistance(start, end) {
    const deltaX = end[0] - start[0];
    const deltaY = end[1] - start[1];
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function calculateTextPositions(coordinates, styleClass) {
    const distances = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
        distances.push(calculateDistance(coordinates[i], coordinates[i+1]));
    }

    let positions = [];
    let accumulateDist = 0;
    const isLocal = styleClass === 'local';

    if (isLocal) {
        let tempPositions = [];
        for (let d of distances) {
            if (d > 60) {
                tempPositions.push(accumulateDist + d / 4);
            }
            accumulateDist += d;
        }
        positions = tempPositions.filter((_, i) => i % 2 === 0);
    } else {
        for (let d of distances) {
            if (d > 60 && d < 100) {
                positions.push(0);
            } else if (d >= 100 && d <= 500) {
                positions.push(accumulateDist + d / 2);
            } else if (d > 500) {
                positions.push(accumulateDist + d / 3);
                positions.push(accumulateDist + 2 * d / 3);
            }
            accumulateDist += d;
        }
    }
    return positions;
}

export default function DiagramCanvas({ trainsData, lineKind, linesStationsForBackground, carKind, focusOnNow }) {
    const labelsRef = useRef(null);
    const transformRef = useRef(null);

    // Constants for drawing
    const hourWidth = 1200;
    
    // Handle initial positioning
    useEffect(() => {
        if (focusOnNow && transformRef.current) {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes();
            
            // Diagram starts at 4.
            let relativeHours;
            if (hours >= 4) {
                relativeHours = hours - 4;
            } else {
                relativeHours = hours + 20;
            }
            
            // X = relativeHours * 1200 + minutes * 20 + 50
            const targetX = relativeHours * 1200 + minutes * 20 + 50;
            
            const scale = 0.5; // Initial scale
            const screenWidth = window.innerWidth;
            // Center-left: 30%
            const translateX = screenWidth * 0.3 - targetX * scale;
            
            // Use setTransform to update position safely
            if (transformRef.current && typeof transformRef.current.setTransform === 'function') {
                transformRef.current.setTransform(translateX, 0, scale, 0);
            }
        }
    }, [focusOnNow]);

    const width = hourWidth * (DiagramHours.length - 1) + 100;
    const height = (linesStationsForBackground && linesStationsForBackground.length > 0) 
        ? linesStationsForBackground[linesStationsForBackground.length - 1].SVGYAXIS + 100 
        : 800;
    const textSpacingFactor = 500;

    // Helper to find stations that need stop (terminal stations)
    const diagramNeedStop = useMemo(() => {
        if (!linesStationsForBackground || linesStationsForBackground.length === 0) return [];
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
                    
                    const { pathString, coordinates } = generatePathData(section, trainKind);
                    const styleClass = carKind[trainKind] || "others";
                    const uniqueId = `${lineKind}-${trainNo}-${idx}`;
                    const textPositions = calculateTextPositions(coordinates, styleClass);

                    renderedPaths.push(
                        <g key={uniqueId}>
                            <path
                                d={pathString}
                                className={styleClass}
                                id={uniqueId}
                                style={{ fill: 'none' }}
                                strokeWidth="2" // Default, CSS can override
                            />
                            {textPositions.map((pos, i) => (
                                <text key={`${uniqueId}-txt-${i}`} dy="-3" className={styleClass} style={{ stroke: 'none', fontWeight: '100', fontSize: '14px' }}>
                                    <textPath href={`#${uniqueId}`} startOffset={pos}>
                                        {trainNo}
                                    </textPath>
                                </text>
                            ))}
                        </g>
                    );
                });
            });
        });

        return renderedPaths;
    }, [trainsData, lineKind, diagramNeedStop, carKind]);


    if (!linesStationsForBackground) return <div>Loading Background...</div>;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', touchAction: 'none' }}>
            <TransformWrapper
                ref={transformRef}
                initialScale={0.5}
                minScale={0.4}                
                maxScale={2}
                centerOnInit={false}
                centerZoomedOut={false}
                limitToBounds={false}
                wheel={{ disabled: false, step: 0.5 }}
                // pinch={{ step: 0.5 }}
                pinch={{ step: 5 }}
                doubleClick={{ step: 0.5 }}
                // panning={{ velocityDisabled: true, lockAxisX: false, lockAxisY: false }}
                panning={{ velocityDisabled: true }}
                onTransformed={(ref) => labelsRef.current?.update(ref.state)}
                onPanning={(ref) => labelsRef.current?.update(ref.state)}
                onZooming={(ref) => labelsRef.current?.update(ref.state)}
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        <FloatingStationLabels 
                            ref={labelsRef}
                            stations={linesStationsForBackground} 
                        />
                        <div style={{ position: 'absolute', zIndex: 10, bottom: 20, right: 20, display: 'flex', gap: '10px' }}>
                            <button onClick={() => zoomIn()} style={buttonStyle}>+</button>
                            <button onClick={() => zoomOut()} style={buttonStyle}>-</button>
                            <button onClick={() => resetTransform()} style={buttonStyle}>Reset</button>
                        </div>
                        <TransformComponent
                            wrapperStyle={{ width: '100%', height: '100%' }}
                            contentStyle={{ width: 'fit-content', height: 'fit-content' }}
                        >
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

                                        svg {font-family: Tahoma, Verdana, sans-serif; font-size: 14px}
                                        
                                        /* Train Styles from CSS */
                                        .taroko, .kuaimu { color: #20b2aa; stroke: currentColor; fill: currentColor; stroke-width: 2; }
                                        .puyuma, .zhongxing, .direct { color: red; stroke: currentColor; fill: currentColor; stroke-width: 2; }
                                        .tze_chiang, .alishan_local { color: orange; stroke: currentColor; fill: currentColor; stroke-width: 2; }
                                        .tze_chiang_diesel { color: gold; stroke: currentColor; fill: currentColor; stroke-width: 2; }
                                        .emu1200 { color: #ff008c; stroke: currentColor; fill: currentColor; stroke-width: 2; }
                                        .emu300 { color: #f44; stroke: currentColor; fill: currentColor; stroke-width: 2; }
                                        .emu3000 { color: #000; stroke: currentColor; fill: currentColor; stroke-width: 2; }
                                        .chu_kuang, .chushan1, .chushan2, .skip_stop { color: #faab82; stroke: currentColor; fill: currentColor; stroke-width: 2; }
                                        .local, .alishan, .all_stop { color: #00f; stroke: currentColor; fill: currentColor; stroke-width: 1.5; }
                                        .local_express { color: #00a6ff; stroke: currentColor; fill: currentColor; stroke-width: 1.5; }
                                        .fu_hsing { color: #00bfff; stroke: currentColor; fill: currentColor; stroke-width: 1.5; }
                                        .ordinary, .theme { color: #006055; stroke: currentColor; fill: currentColor; stroke-width: 1.5; }
                                        .special { color: #ff1493; stroke: currentColor; fill: currentColor; stroke-width: 2; }
                                        .others { color: grey; stroke: currentColor; fill: currentColor; stroke-width: 1; }

                                        // @media (prefers-color-scheme: dark) {
                                        //     .hour_line { stroke: #555; stroke-width: 1; }
                                        //     .min10_line { stroke: #333; stroke-width: 1; }
                                        //     .min30_line { stroke: #444; stroke-width: 1; }
                                        //     .station_line { stroke: #555; stroke-width: 1; }
                                        //     .station_noserv_line { stroke: #222; stroke-width: 1; stroke-dasharray: 5,5; }
                                        //     .hour_text { font-size: 12px; fill: #999; }
                                        //     .station_text { font-size: 12px; fill: #999; }
                                            
                                        //     /* Train Styles from CSS */
                                        //     .emu3000 { stroke: #fff; stroke-width: 2; }
                                        //     .local, .alishan, .all_stop { stroke: #7676ff; stroke-width: 1.5; }
                                        //     .ordinary, .theme { stroke: #00ffe1; stroke-width: 1.5; }
                                        //     .others { stroke: #7f7f7f; stroke-width: 1; }
                                        // }
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
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
}

const buttonStyle = {
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
};
