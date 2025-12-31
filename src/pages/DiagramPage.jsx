
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DiagramCanvas from '../components/DiagramCanvas';
import SidebarContainer from '../components/Sidebar/SidebarContainer';
import { getTodayFormattedDate } from '../utils/commonUtils';
import { DataFiles } from '../utils/constants';
import { processLineData, jsonToTrainsData } from '../utils/dataUtils';
import styles from '../components/Sidebar/Sidebar.module.css';

export default function DiagramPage() {
    const { lineKind } = useParams();
    const [date, setDate] = useState(getTodayFormattedDate('nodash'));
    const [trainsData, setTrainsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [error, setError] = useState(null);
    const [backgroundData, setBackgroundData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            // 如果已經有資料，則進入 transition 模式而不是全螢幕 loading
            if (trainsData.length > 0) {
                setIsTransitioning(true);
            } else {
                setLoading(true);
            }

            try {
                // 為了平滑切換，我們至少等待 1 秒
                const startTime = Date.now();

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
                const processedTrains = jsonToTrainsData(dailyDataRes, '', lineKind, routeRes, svgXAxisRes, linesStations);

                // 計算剩餘需要等待的時間（確保至少 1 秒）
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, 1000 - elapsedTime);

                setTimeout(() => {
                    setBackgroundData({
                        linesStationsForBackground: linesStationsForBackground[lineKind],
                        svgXAxis: svgXAxisRes,
                        route: routeRes,
                        carKind: carKindRes
                    });
                    setTrainsData(processedTrains);
                    setLoading(false);
                    setIsTransitioning(false);
                }, remainingTime);

            } catch (err) {
                console.error(err);
                setError(err.message);
                setLoading(false);
                setIsTransitioning(false);
            }
        }

        if (lineKind) {
            fetchData();
        }
    }, [lineKind, date]);

    if (loading && trainsData.length === 0) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className={styles.loadingSpinner}></div>
            <span style={{ marginLeft: '1rem' }}>載入中...</span>
        </div>
    );

    if (error) return <div>Error: {error}</div>;

    return (
        <div
            style={{
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 5rem)',
                backgroundColor: 'inherit',
            }}
        >
            {/* 過渡動畫遮罩 */}
            <div className={`${styles.loadingOverlay} ${isTransitioning ? styles.loadingOverlayVisible : ''}`}>
                <div className={styles.loadingSpinner}></div>
            </div>

            <SidebarContainer currentDate={date} onDateSelect={setDate} />
            
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
