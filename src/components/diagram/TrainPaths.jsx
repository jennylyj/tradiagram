import React, { useMemo, memo } from 'react';
import { DiagramHours } from '../../utils/constants';
import { calculateTextPositions } from '../../utils/diagramUtils';

const TrainSegment = memo(({ uniqueId, pathString, styleClass, textPositions, trainNo, isHighlighted }) => {
    const domId = isHighlighted ? `${uniqueId}-highlight` : uniqueId;

    return (
        <g>
            <path
                id={domId}
                d={pathString}
                className={styleClass}
                style={{fill: 'none'}}
            />
            {textPositions.map((pos, i) => (
                <text key={`${uniqueId}-txt-${i}`} dy="-3" className={styleClass} style={{ strokeWidth: '0.5', fontWeight: '100', fontSize: '0.875rem' }}>
                    <textPath href={`#${domId}`} startOffset={pos}>
                        {trainNo}
                    </textPath>
                </text>
            ))}
        </g>
    );
});

const TrainPaths = memo(({ trainsData, lineKind, carKind, diagramNeedStop, selectedTrainNos = [] }) => {
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

    const pathSegments = useMemo(() => {
        if (!trainsData || !carKind) return [];

        const segments = [];

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

                    segments.push({
                        uniqueId,
                        pathString,
                        styleClass,
                        textPositions,
                        trainNo
                    });
                });
            });
        });

        return segments;
    }, [trainsData, lineKind, diagramNeedStop, carKind]);

    const { baseLayer, highlightLayer } = useMemo(() => {
        const hasSelection = selectedTrainNos && selectedTrainNos.length > 0;
        const base = (
            <g style={{ opacity: hasSelection ? 0.1 : 1, transition: 'opacity 0.2s' }}>
                {pathSegments.map(segment => (
                    <TrainSegment 
                        key={segment.uniqueId}
                        {...segment}
                        isHighlighted={false}
                    />
                ))}
            </g>
        );

        // Highlight layer
        let highlight = null;
        if (hasSelection) {
            const selectedSegments = pathSegments.filter(s => selectedTrainNos.includes(s.trainNo));
            highlight = (
                <g>
                    {selectedSegments.map(segment => (
                        <TrainSegment 
                            key={`selected-${segment.uniqueId}`}
                            {...segment}
                            isHighlighted={true}
                        />
                    ))}
                </g>
            );
        }

        return { baseLayer: base, highlightLayer: highlight };
    }, [pathSegments, selectedTrainNos]);

    return (
        <>
            {baseLayer}
            {highlightLayer}
        </>
    );
});

export default TrainPaths;
