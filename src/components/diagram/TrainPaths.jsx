import React, { useMemo, memo } from 'react';
import { DiagramHours } from '../../utils/constants';
import { calculateTextPositions } from '../../utils/diagramUtils';

const TrainPaths = memo(({ trainsData, lineKind, carKind, diagramNeedStop }) => {
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

    const renderedPaths = useMemo(() => {
        if (!trainsData || !carKind) return [];

        const paths = [];

        trainsData.forEach(trainGroup => {
            trainGroup.forEach(([lKind, trainNo, trainKind, line, lineDir, value]) => {
                if (lKind !== lineKind) return;
                if (value.length <= 2) return;

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

                    paths.push(
                        <g key={uniqueId}>
                            <path
                                d={pathString}
                                className={styleClass}
                                id={uniqueId}
                                style={{ fill: 'none' }}
                            />
                            {textPositions.map((pos, i) => (
                                <text key={`${uniqueId}-txt-${i}`} dy="-3" className={styleClass} style={{ stroke: 'none', fontWeight: '100', fontSize: '0.875rem' }}>
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

        return paths;
    }, [trainsData, lineKind, diagramNeedStop, carKind]);

    return <>{renderedPaths}</>;
});

export default TrainPaths;
