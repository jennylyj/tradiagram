
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
export function calculateTextPosition(coordinates, color) {
    let coordinates_pairs_temp = [];
    let coordinates_distance = []; // 用來置放每一個轉折點之間的長度

    for (const iterator of coordinates) {
        if (coordinates_pairs_temp.length === 2) {
            let distance = calculateDistance(coordinates_pairs_temp[0], coordinates_pairs_temp[1]);
            coordinates_distance.push(distance);
            coordinates_pairs_temp[0] = coordinates_pairs_temp[1];
            coordinates_pairs_temp[1] = iterator;
        } else if (coordinates_pairs_temp.length === 1) {
            coordinates_pairs_temp.push(iterator);
        } else if (coordinates_pairs_temp.length === 0) {
            coordinates_pairs_temp.push(iterator);
        }
    }

    if (coordinates_pairs_temp.length == 2) {
        coordinates_distance.push(calculateDistance(coordinates_pairs_temp[0], coordinates_pairs_temp[1]));
    }

    // 標號邏輯
    let text_position = []; // 用來置放標號定位點
    let accumulate_dist = 0; // 所有轉折點的長度累進

    if (color === "local") {
        let new_text_position = [];
        for (let item of coordinates_distance) {
            if (item > 60) {
                const pos = accumulate_dist + item / 4;
                text_position.push(pos);
            }
            accumulate_dist += item;
        }

        for (let i = 0; i < text_position.length; i++) {
            if (i % 2 === 0) {
                new_text_position.push(text_position[i]);
            }
        }

        text_position = new_text_position;
    } else {
        for (let item of coordinates_distance) {
            if (item > 60 && item < 100) {
                text_position.push(0);
            } else if (item >= 100 && item <= 500) {
                const pos = accumulate_dist + item / 2;
                text_position.push(pos);
            } else if (item > 500) {
                for (let i = 1; i <= 2; i++) {
                    const pos = accumulate_dist + i * (item / 3);
                    text_position.push(pos);
                }
            }
            accumulate_dist += item;
        }
    }
    return text_position;
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
