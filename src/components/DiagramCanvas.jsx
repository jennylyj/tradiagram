import React, { useMemo, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import FloatingStationLabels from './FloatingStationLabels';
import { DiagramHours } from '../utils/constants';
import DiagramBackground from './diagram/DiagramBackground';
import TrainPaths from './diagram/TrainPaths';
import CurrentTimeLine from './diagram/CurrentTimeLine';

export default function DiagramCanvas({ trainsData, lineKind, linesStationsForBackground, carKind, focusOnNow }) {
    const labelsRef = useRef(null);
    const transformRef = useRef(null);

    // Constants for drawing
    const hourWidth = 1200;
    const width = hourWidth * (DiagramHours.length - 1) + 100;
    const height = (linesStationsForBackground && linesStationsForBackground.length > 0) 
        ? linesStationsForBackground[linesStationsForBackground.length - 1].SVGYAXIS + 100 
        : 800;
    const textSpacingFactor = 500;

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

    // Helper to find stations that need stop (terminal stations)
    const diagramNeedStop = useMemo(() => {
        if (!linesStationsForBackground || linesStationsForBackground.length === 0) return [];
        return linesStationsForBackground
            .filter(item => item.TERMINAL === 'Y')
            .map(item => item.ID);
    }, [linesStationsForBackground]);

    if (!linesStationsForBackground) return <div>Loading Background...</div>;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', overscrollBehavior: 'none', touchAction: 'none' }}>
            <TransformWrapper
                ref={transformRef}
                initialScale={0.5}
                minScale={0.4}                
                maxScale={2}
                centerOnInit={false}
                centerZoomedOut={false}
                limitToBounds={true}
                // wheel={{ step: 0.1, activationKeys: ['Control', 'Meta'] }}
                wheel={{ wheelDisabled: true }}
                pinch={{ step: 10.0 }}
                doubleClick={{ step: 0.5 }}
                // panning={{ disabled: false, wheelPanning: true, velocityDisabled: true, lockAxisX: false, lockAxisY: false, excluded: ["Control", "Meta"] }}
                panning={{ disabled: false, wheelPanning: true, velocityDisabled: true, lockAxisX: false, lockAxisY: false }}
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
                        <div style={{ position: 'fixed', zIndex: 10, bottom: 10, right: 10, display: 'flex', gap: '10px' }}>
                            <button onClick={() => zoomIn()} style={buttonStyle}>+</button>
                            <button onClick={() => zoomOut()} style={buttonStyle}>-</button>
                            <button onClick={() => resetTransform()} style={buttonStyle}>Reset</button>
                        </div>
                        <TransformComponent
                            wrapperStyle={{ width: '100vw', height: '100vh', boxSizing: 'border-box' }}
                            contentStyle={{ width: `${width}px`, height: `${height+200}px`, boxSizing: 'border-box' }}
                        >
                            <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
                                <DiagramBackground 
                                    width={width} 
                                    height={height} 
                                    linesStationsForBackground={linesStationsForBackground}
                                    textSpacingFactor={textSpacingFactor}
                                />
                                
                                <TrainPaths 
                                    trainsData={trainsData}
                                    lineKind={lineKind}
                                    carKind={carKind}
                                    diagramNeedStop={diagramNeedStop}
                                />

                                <CurrentTimeLine height={height} />
                            </svg>

                                <CurrentTimeLine height={height} />
                            
                        </TransformComponent>
                    </>
                )}
            </TransformWrapper>
        </div>
    );
}

const buttonStyle = {
    padding: '0.75rem 1.25rem',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #999',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    minWidth: '48px',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};
