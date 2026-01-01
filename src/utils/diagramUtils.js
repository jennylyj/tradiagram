
// 計算平面上兩點距離函式
export function calculateDistance(start, end) {
    const deltaX = end[0] - start[0];
    const deltaY = end[1] - start[1];
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance;
}

// 計算插補資料
export function interpolateArray(A, B) {
    const result = [];

    for (let i = 0; i < A.length; i++) {
        if (!isNaN(B[i])) {
            result[i] = B[i];
        } else {
            const referenceValue = A[i];
            let prevIndex = i - 1;
            let nextIndex = i + 1;

            while (isNaN(B[prevIndex]) && prevIndex >= 0) {
                prevIndex--;
            }

            while (isNaN(B[nextIndex]) && nextIndex < A.length) {
                nextIndex++;
            }

            const prevValue = B[prevIndex];
            const nextValue = B[nextIndex];
            const prevDiff = referenceValue - A[prevIndex];
            const nextDiff = A[nextIndex] - referenceValue;
            const totalDiff = prevDiff + nextDiff;

            const value = (prevValue * nextDiff + nextValue * prevDiff) / totalDiff;
            result[i] = Math.round((value + Number.EPSILON) * 100) / 100;
        }
    }

    return result;
}

// 找出不連續資料的函式
export function findUncontinuousIndex(value) {
    let order_next = value[0][5];
    let index = 0;

    for (const [dsc, id, time, loc, stop, order] of value) {
        if (order == order_next) {
            order_next += 1;
            index += 1;
        }
        else {
            break
        }
    }
    return index;
}

// 計算車次號標註的位置
export function calculateTextPositions(coordinates, styleClass) {
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

// 取得現在時間，轉換成X軸
export function getNowTimeXAxis(minus_time, svgXAxis, diagramHours) {    
    let currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - minus_time);

    // 取得減去10分鐘後的台北時間
    let options = { timeZone: 'Asia/Taipei', hour12: false };
    // Note: toLocaleString might behave differently in different environments, 
    // but we keep the logic for now.
    
    let hours = currentTime.getHours().toString().padStart(2, '0');
    let minutes = currentTime.getMinutes().toString().padStart(2, '0');
    let seconds = currentTime.getSeconds().toString().padStart(2, '0');

    // 將秒調整為最接近的 00 或 30
    seconds = Math.round(seconds / 30) * 30;
    seconds = seconds === 60 ? '00' : seconds.toString().padStart(2, '0');

    const timeKey = `${hours}:${minutes}:${seconds}`;
    if (!svgXAxis[timeKey]) return 0; // Safety check

    const x = svgXAxis[timeKey].ax1 * 10 - 1200 * diagramHours[0] + 50;
    return x;
}

// 找出運行圖中必須標註的車站
export function findDiagramNeedToStop(line_kind, linesStationsForBackground) {
    let diagram_need_stop = [];
    const stations = linesStationsForBackground[line_kind];
    if (!stations) return [];

    for (let item of stations) {
        if (item['TERMINAL'] == 'Y')
            diagram_need_stop.push(item['ID']);
    }
    return diagram_need_stop;
}
