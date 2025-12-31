
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
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // 水平置中
                justifyContent: 'flex-start', // 垂直上對齊
                paddingTop: 20,
            }}
        >
            <SidebarContainer />
            <div style={{ width: '100%', maxWidth: 1200, textAlign: 'center', marginBottom: 25 }}>
                Diagram: {lineKind} - {date}
            </div>
            <div style={{ width: '100%', maxWidth: 1200 }}>
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
