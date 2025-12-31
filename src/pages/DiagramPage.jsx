
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DiagramCanvas from '../components/DiagramCanvas';
import SidebarContainer from '../components/Sidebar/SidebarContainer';
import { getTodayFormattedDate } from '../utils/commonUtils';
import { DataFiles } from '../utils/constants';
import { processLineData, jsonToTrainsData } from '../utils/dataUtils';

export default function DiagramPage() {
    const { lineKind } = useParams();
    const [date, setDate] = useState(getTodayFormattedDate('nodash'));
    const [trainsData, setTrainsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [backgroundData, setBackgroundData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch all reference data
                const [routeRes, svgXAxisRes, svgYAxisRes, carKindRes, dailyDataRes] = await Promise.all([
                    fetch(DataFiles.Route).then(res => res.json()),
                    fetch(DataFiles.SVG_X_Axis).then(res => res.json()),
                    fetch(DataFiles.SVG_Y_Axis).then(res => res.json()),
                    fetch(DataFiles.CarKind).then(res => res.json()),
                    fetch(`/data/${date}.json`).then(res => res.json())
                ]);

                // Process Line Data
                const { linesStations, linesStationsForBackground } = processLineData(svgYAxisRes);
                
                // Process Train Data
                // jsonToTrainsData(jsonData, trainNoInput, lineKind, route, svgXAxis, linesStations)
                const processedTrains = jsonToTrainsData(dailyDataRes, '', lineKind, routeRes, svgXAxisRes, linesStations);

                setBackgroundData({
                    linesStationsForBackground: linesStationsForBackground[lineKind],
                    svgXAxis: svgXAxisRes,
                    route: routeRes,
                    carKind: carKindRes
                });
                setTrainsData(processedTrains);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (lineKind) {
            fetchData();
        }
    }, [lineKind, date]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div
            style={{
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 5rem)', // 這裡調整內容與頂部的間距
                backgroundColor: 'inherit',
            }}
        >
            <SidebarContainer />
            
            {/* 頂部標題列白色底色 */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 'calc(env(safe-area-inset-top, 0px) + 4.5rem)', // 您可以在這裡調整白色底的高度
                backgroundColor: 'white',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'flex-end',
                paddingBottom: '0.5rem',
                paddingLeft: '4.5rem'
            }}>
                <h1 style={{ 
                    margin: '22px 10px', 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold',
                    color: '#333',
                    whiteSpace: 'nowrap'
                }}>
                    {lineKind} - {date}
                </h1>
            </div>
            
            <div style={{ width: '100%', maxWidth: 1200, flex: 1 }}>
                <DiagramCanvas
                    trainsData={trainsData}
                    lineKind={lineKind}
                    linesStationsForBackground={backgroundData?.linesStationsForBackground}
                    carKind={backgroundData?.carKind}
                />
            </div>
        </div>
    );
}
