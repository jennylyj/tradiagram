import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';

const FloatingStationLabels = forwardRef(({ stations }, ref) => {
    const [scale, setScale] = useState(0.5);
    const containerRef = useRef(null);
    const scaleRef = useRef(0.5);

    useImperativeHandle(ref, () => ({
        update: (newState) => {
            const { scale: newScale, positionY } = newState;
            
            // Direct DOM update for Y position (Performance optimization)
            if (containerRef.current) {
                containerRef.current.style.transform = `translateY(${positionY}px)`;
            }

            // Only trigger re-render if scale changes
            if (newScale !== scaleRef.current) {
                scaleRef.current = newScale;
                setScale(newScale);
            }
        }
    }));

    if (!stations) return null;

    // Filter stations based on zoom level (scale)
    const visibleStations = stations.filter(station => {
        const weight = station.WEIGHT || 1;
        if (scale > 0.6) return true; // Show all
        if (scale >= 0.5) return weight >= 2; // Show 2 and 3
        return weight >= 3; // Default for < 0.4, keep showing major stations
    });

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', // Cover the wrapper
            height: '100%',
            pointerEvents: 'none', // Let clicks pass through to canvas
            zIndex: 10, // Ensure on top of canvas
            overflow: 'hidden' // Ensure labels don't spill out of the wrapper area
        }}>
            {/* Inner container that moves with Y panning */}
            <div 
                ref={containerRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    maxHeight: '100%',
                    willChange: 'transform', // Hint for browser optimization
                }}
            >
                {visibleStations.map((station, index) => {
                    // Calculate Y position relative to the moving container
                    // We only apply scale here. The translation is on the parent div.
                    const top = (station.SVGYAXIS + 50) * scale;
                    
                    return (
                        <div key={`${station.ID}-${index}`} style={{
                            position: 'absolute',
                            top: `${top}px`,
                            left: '10px', // Fixed to left side
                            transform: 'translateY(-50%)', // Center vertically on the line
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #ddd',
                            borderRadius: '12px', // Rounded corners
                            padding: '4px 0',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            width: '80px', // Fixed width
                            textAlign: 'center',
                            color: '#333',
                            pointerEvents: 'auto' // Allow hovering/clicking if needed
                        }}>
                            {station.DSC}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default FloatingStationLabels;
