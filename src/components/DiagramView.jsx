
import React, { useEffect, useState } from 'react';
import DiagramCanvas from './DiagramCanvas';
import { DataFiles } from '../utils/constants';
import { processLineData, jsonToTrainsData } from '../utils/dataUtils';
import styles from './Sidebar/Sidebar.module.css';

export default function DiagramView({ lineKind, date, showLoading = true, isBackground = false }) {
    const [trainsData, setTrainsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [backgroundData, setBackgroundData] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            console.log(`Fetching data for ${lineKind} on ${date}...`);
            try {
                // Fetch all reference data
                const [routeRes, svgXAxisRes, svgYAxisRes, carKindRes, dailyDataRes] = await Promise.all([
                    fetch(DataFiles.Route).then(res => res.json()),
                    fetch(DataFiles.SVG_X_Axis).then(res => res.json()),
                    fetch(DataFiles.SVG_Y_Axis).then(res => res.json()),
                    fetch(DataFiles.CarKind).then(res => res.json()),
                    fetch(`/data/${date}.json`).then(res => {
                        if (!res.ok) throw new Error(`Data file for ${date} not found`);
                        return res.json();
                    })
                ]);

                if (!isMounted) return;

                // Process Line Data
                const { linesStations, linesStationsForBackground } = processLineData(svgYAxisRes);
                
                // Process Train Data
                const processedTrains = jsonToTrainsData(dailyDataRes, '', lineKind, routeRes, svgXAxisRes, linesStations);

                setBackgroundData({
                    linesStationsForBackground: linesStationsForBackground[lineKind],
                    svgXAxis: svgXAxisRes,
                    route: routeRes,
                    carKind: carKindRes
                });
                setTrainsData(processedTrains);
                setLoading(false);
                console.log(`Data loaded for ${lineKind}`);

            } catch (err) {
                console.error("Error loading diagram data:", err);
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        }

        if (lineKind && date) {
            fetchData();
        }
        return () => { isMounted = false; };
    }, [lineKind, date]);

    if (loading) {
        if (showLoading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                    <div className={styles.loadingSpinner}></div>
                </div>
            );
        }
        return null;
    }

    if (error) {
        return (
            <div style={{ 
                color: isBackground ? 'rgba(255,255,255,0.3)' : 'red', 
                padding: '20px',
                textAlign: 'center',
                width: '100%'
            }}>
                {isBackground ? "Background data unavailable" : `Error: ${error}`}
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <DiagramCanvas
                trainsData={trainsData}
                lineKind={lineKind}
                linesStationsForBackground={backgroundData?.linesStationsForBackground}
                carKind={backgroundData?.carKind}
                isBackground={isBackground}
            />
        </div>
    );
}
