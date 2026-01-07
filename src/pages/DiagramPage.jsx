
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import DiagramCanvas from '../components/DiagramCanvas';
import SidebarContainer from '../components/Sidebar/SidebarContainer';
import { getTodayFormattedDate } from '../utils/commonUtils';
import { DataFiles, BASE_URL } from '../utils/constants';
import { LineDict } from '../utils/constants';
import { processLineData, jsonToTrainsData } from '../utils/dataUtils';
import styles from '../components/Sidebar/Sidebar.module.css';

export default function DiagramPage() {
    const { lineKind } = useParams();
    const [searchParams] = useSearchParams();
    const queryDate = searchParams.get('date');
    const [date, setDate] = useState(queryDate || getTodayFormattedDate('nodash'));
    const [trainsData, setTrainsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [error, setError] = useState(null);
    const [backgroundData, setBackgroundData] = useState(null);

    useEffect(() => {
        if (queryDate) {
            setDate(queryDate);
        }
    }, [queryDate]);

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
                    fetch(`${BASE_URL}data/${date}.json`).then(res => res.json())
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
                width: '100%',
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 5rem)',
                backgroundColor: 'inherit',
                overflow: 'hidden',
                boxSizing: 'border-box',
                overscrollBehavior: 'none',
            }}
        >
            {/* 過渡動畫遮罩 */}
            <div className={`${styles.loadingOverlay} ${isTransitioning ? styles.loadingOverlayVisible : ''}`}>
                <div className={styles.loadingSpinner}></div>
            </div>

            <SidebarContainer currentDate={date} onDateSelect={setDate} />
            
            {/* 頂部標題列白色底色 */}
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>
                    {LineDict[lineKind]} - {date}
                </h1>
            </div>
            
            <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                <DiagramCanvas 
                    trainsData={trainsData} 
                    lineKind={lineKind}
                    linesStationsForBackground={backgroundData?.linesStationsForBackground}
                    carKind={backgroundData?.carKind}
                    focusOnNow={true}
                />
            </div>
        </div>
    );
}
