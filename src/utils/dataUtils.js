
// JSON檔處理，將JSON檔案轉換成時間空間資料，可指定車次
export function jsonToTrainsData(jsonData, trainNoInput, lineKind, route, svgXAxis, linesStations) {
    let all_trains_data = [];
    let train_no = "";

    if (!jsonData || !Array.isArray(jsonData['TrainInfos'])) {
        console.warn("JSON資料格式錯誤，無法處理");
        return all_trains_data;
    }

    for (let i = 0; i < jsonData['TrainInfos'].length; i++) {
        try {
            let trainInfo = jsonData['TrainInfos'][i];

            // 確保資料存在
            if (!trainInfo || typeof trainInfo['Train'] === "undefined") {
                console.warn(`TrainInfos[${i}] 缺少 Train 欄位，已跳過`);
                continue;
            }

            // 決定要處理的車次編號
            train_no = (trainNoInput.length === 0) ? trainInfo['Train'] : trainNoInput;

            // 過濾：只處理目標車次
            if (trainInfo['Train'] == train_no) {
                let train_data = calculateSpaceTime(trainInfo, lineKind, route, svgXAxis, linesStations);  // 車次資料處理，轉換成時間空間資料

                if (train_data && Array.isArray(train_data)) {
                    all_trains_data.push(train_data);
                } else {
                    // console.warn(`train_no=${train_no} 的空間時間資料無效，已跳過`);
                }
            }
        } catch (e) {
            console.error(`車次：${train_no} 資料處理失敗，已跳過，錯誤訊息：`, e);
            continue;
        }
    }

    return all_trains_data;
}

// 處理車次資料
function calculateSpaceTime(train, lineKind, route, svgXAxis, linesStations) {
    const train_id = train['Train'];                 // 車次代碼
    const car_class = train['CarClass'];             // 車種代碼
    const line = train['Line'];                      // 山線1、海線2、成追線3，東部幹線則為0
    const line_dir = train['LineDir'];               // 順行1、逆行2
    const timetable = train['TimeInfos'];

    let timetable_dict = {};                         // 暫存車次時刻表物件
    let _trains_data = [];                           // 時刻表轉換後的時間空間資料，包括各個營運路線

    for (let TimeInfos of train.TimeInfos) {
        timetable_dict[TimeInfos.Station] = [TimeInfos.ARRTime, TimeInfos.DEPTime, TimeInfos.Station, TimeInfos.Order];
    }

    const passing_stations = findPassingStations(timetable, line, line_dir, route);                 // 找出車次「停靠與通過」的所有車站
    const estimate_time_space = estimateTimeSpace(timetable_dict, passing_stations, svgXAxis);          // 整理車次通過的所有車站到站與離站時間
    const operation_lines = timeSpaceToOperationLines(estimate_time_space, lineKind, linesStations);     // 將車次的通過車站、到離站時間轉入各營運路線

    Object.entries(operation_lines).forEach(([key, value]) => {
        _trains_data.push([key, train_id, car_class, line, line_dir, value]);
    })

    return _trains_data;
}

// 查詢車次會「停靠與通過」的所有車站
function findPassingStations(timetable, line, line_dir, route) {
    const start_station = timetable[0]['Station'];
    let end_station = timetable[timetable.length - 1]['Station'];

    let _passing_stations = [];
    let station = start_station;
    let km = 0.0;

    let cheng_zhui = false;

    let roundabout_train = false;
    if (end_station == '1001') {
        end_station = start_station;
        roundabout_train = true;
    }

    let stations = [];
    for (let item of timetable) {
        stations.push(item['Station']);
    }

    if (line == "3") {
        cheng_zhui = true;
    } else if (stations.includes('2260') && stations.includes('3350')) {
        cheng_zhui = true;
    }

    let neiwan = false;
    if (stations.includes('1194') || stations.includes('1203')) {
        neiwan = true;
    }

    let pingxi = false;
    if (stations.includes('7332')) {
        pingxi = true;
    }

    let jiji = false;
    if (stations.includes('3432') || stations.includes('3431')) {
        jiji = true;
    }

    let shalun = false;
    if (stations.includes('4272')) {
        shalun = true;
    }

    while (true) {
        // Safety check for route[station]
        if (!route[station]) {
            console.warn(`Station ${station} not found in Route data.`);
            break;
        }

        _passing_stations.push([String(station), route[station].DSC, route[station].KM, km]);

        if (line_dir == '2') {
            if (cheng_zhui == false) {
                let branch = route[station].CCW_BRANCH;
                if (branch != '') {
                    if (station == '7360') {
                        if (end_station == '7362') {
                            km += parseFloat(route[station].CCW_BRANCH_KM);
                            station = '7361';
                        } else if (end_station != '7362') {
                            km += parseFloat(route[station].CCW_KM);
                            station = route[station].CCW;
                        }
                    } else if (station == '3430') {
                        if (jiji == true) {
                            km += parseFloat(route[station].CCW_BRANCH_KM);
                            station = '3431';
                        } else if (jiji == false) {
                            km += parseFloat(route[station].CCW_KM);
                            station = route[station].CCW;
                        }
                    } else if (station == '4270') {
                        if (shalun == true) {
                            km += parseFloat(route[station].CCW_BRANCH_KM);
                            station = '4271';
                        } else if (shalun == false) {
                            km += parseFloat(route[station].CCW_KM);
                            station = route[station].CCW;
                        }
                    } else {
                        if (line == '1' || line == '0') {
                            km += parseFloat(route[station].CCW_KM);
                            station = route[station].CCW;
                        } else if (line == '2') {
                            km += parseFloat(route[station].CCW_BRANCH_KM);
                            station = route[station].CCW_BRANCH;
                        }
                    }
                } else {
                    km += parseFloat(route[station].CCW_KM);
                    station = route[station].CCW;
                }
            } else {
                km += parseFloat(route[station].CHENG_ZHUI_CCW_KM);
                station = route[station].CHENG_ZHUI_CCW;
            }
        } else if (line_dir == '1') {
            if (cheng_zhui == false) {
                let branch = route[station].CW_BRANCH;
                if (branch != '') {
                    if (station == '0920') {
                        if (end_station != '0900') {
                            km += parseFloat(route[station].CW_BRANCH_KM);
                            station = route[station].CW_BRANCH;
                        } else if (end_station == '0900') {
                            km += parseFloat(route[station].CW_KM);
                            station = route[station].CW;
                        }
                    } else if (station == '7130') {
                        if (end_station == '7120') {
                            km += parseFloat(route[station].CW_BRANCH_KM);
                            station = '7120';
                        } else if (end_station != '7120') {
                            km += parseFloat(route[station].CW_KM);
                            station = '7110';
                        }
                    } else if (station == '1190' || station == '1193') {
                        if (neiwan == true) {
                            km += parseFloat(route[station].CW_BRANCH_KM);
                            if (station == '1190') {
                                station = '1191';
                            } else if (station == '1193') {
                                if (end_station == '1208' || end_station == '1203') {
                                    station = '1201';
                                } else if (end_station == '1194') {
                                    station = '1194';
                                }
                            }
                        } else if (neiwan == false) {
                            km += parseFloat(route[station].CW_KM);
                            station = '1180';
                        }
                    } else if (station == '7330') {
                        if (pingxi == true) {
                            km += parseFloat(route[station].CW_BRANCH_KM);
                            station = '7331';
                        } else if (pingxi == false) {
                            km += parseFloat(route[station].CW_KM);
                            station = '7320';
                        }
                    } else {
                        if (line == '1' || line == '0') {
                            km += parseFloat(route[station].CW_KM);
                            station = route[station].CW;
                        } else if (line == '2') {
                            km += parseFloat(route[station].CW_BRANCH_KM);
                            station = route[station].CW_BRANCH;
                        }
                    }
                } else {
                    km += parseFloat(route[station].CW_KM);
                    station = route[station].CW;
                }
            } else {
                km += parseFloat(route[station].CHENG_ZHUI_CW_KM);
                station = route[station].CHENG_ZHUI_CW;
            }
        }

        if (station == end_station) {
            if (roundabout_train == true) {
                _passing_stations.push(['1001', route[station].DSC, route[station].KM, km]);
                break;
            } else {
                _passing_stations.push([String(station), route[station].DSC, route[station].KM, km]);
                break;
            }
        }

        if (_passing_stations.length > 200) {
            break;
        }
    }

    return _passing_stations;
}

// 整理車次會通過的所有車站到站與離站時間
function estimateTimeSpace(timetable, passing_stations, svgXAxis) {
    let _estimate_time_space = {};
    let index = 0;
    const timetable_stations = Object.keys(timetable);

    // 將起終點中間歷經的停靠與通過車站均找出
    for (const [StationId, StationName, LocationKM, KM] of passing_stations) {
        if (timetable_stations.includes(StationId)) {
            let ARRTime = parseFloat(svgXAxis[timetable[StationId][0]].ax1);
            let DEPTime = parseFloat(svgXAxis[timetable[StationId][1]].ax1);
            let Order = parseInt(timetable[StationId][3]);

            _estimate_time_space[index] = [StationId, StationName, parseFloat(KM), ARRTime, Order];
            _estimate_time_space[index += 1] = [StationId, StationName, parseFloat(KM), DEPTime, Order];
            index += 1;
        } else {
            _estimate_time_space[index] = [StationId, StationName, parseFloat(KM), NaN, -1];
            index += 1;
        }
    }

    // 環島、跨午夜車次處理
    let after_midnight_row_index = -1;
    let last_time_value = -1;

    Object.entries(_estimate_time_space).forEach(([key, value]) => {
        // 環島車次處理
        if (value[0] == "1001") {
            value[0] = "1000";
        }
        // 跨午夜車次處理
        if (!isNaN(value[3])) {
            if (value[3] < last_time_value) {
                after_midnight_row_index = parseInt(key);
            }
            last_time_value = value[3];
        }
    })

    // 跨午夜車次處理：將超過午夜的時間一律加上 2880
    if (after_midnight_row_index != -1) {
        Object.entries(_estimate_time_space).forEach(([key, value]) => {
            if (parseInt(key) >= after_midnight_row_index) {
                value[3] += 2880;
            }
        })
    }

    // 將所有停靠與通過車站的時間都存到暫存陣列
    let interpolate = []
    Object.entries(_estimate_time_space).forEach(([key, value]) => {
        interpolate.push(value[3]);
    })

    // 計算沒有時間的通過車站插補資料
    const interpolatedArray = linearInterpolation(interpolate);
    Object.entries(_estimate_time_space).forEach(([key, value]) => {
        value[3] = interpolatedArray[key];
    })

    return _estimate_time_space;
}

// 將車次通過車站時間轉入各營運路線的資料
function timeSpaceToOperationLines(estimate_time_space, line_kind, linesStations) {
    let _operation_lines = {};

    for (let key in linesStations) {
        _operation_lines[key] = [];
    }

    // 迭代df_estimate_time_space的每一列
    Object.entries(estimate_time_space).forEach(([key, value]) => {
        Object.entries(linesStations).forEach(([key1, value1]) => {
            if (key1 == line_kind)
                if (value[0] in value1)
                    _operation_lines[key1].push([value[1], value[0], value[3], linesStations[key1][value[0]]['SVGYAXIS'], value[4], parseInt(key)]);
        })
    })

    return _operation_lines;
}

// 計算陣列資料插補的函式
function linearInterpolation(array) {
    for (let i = 0; i < array.length; i++) {
        if (isNaN(array[i])) {
            let prevValue;
            let nextValue;
            let prevIndex;
            let nextIndex;

            // 找到前一個非NaN元素
            for (let j = i - 1; j >= 0; j--) {
                if (!isNaN(array[j])) {
                    prevValue = array[j];
                    prevIndex = j;
                    break;
                }
            }

            // 找到後一個非NaN元素
            for (let j = i + 1; j < array.length; j++) {
                if (!isNaN(array[j])) {
                    nextValue = array[j];
                    nextIndex = j;
                    break;
                }
            }

            // 計算索引差距和數值差距
            const indexDiff = nextIndex - prevIndex;
            const valueDiff = nextValue - prevValue;

            // 線性插補
            const interpolatedValue = prevValue + (valueDiff / indexDiff) * (i - prevIndex);
            array[i] = interpolatedValue;
        }
    }

    return array;
}

// 初始化線路資料
export function processLineData(svgYAxisData) {
    let linesStations = {};
    let linesStationsForBackground = {};

    Object.entries(svgYAxisData).forEach(([key, value]) => {
        let stations_loc = {};
        let stations_loc_for_background = [];
        for (let i = 0; i < value.length; i++) {
            if (value[i]['ID'] != 'NA')
                stations_loc[value[i]['ID']] = { 'DSC': value[i]['DSC'], 'SVGYAXIS': value[i]['SVGYAXIS'] };
            stations_loc_for_background.push({ 'ID': value[i]['ID'], 'DSC': value[i]['DSC'], 'SVGYAXIS': value[i]['SVGYAXIS'], 'TERMINAL': value[i]['TERMINAL'] });
        }
        linesStations[key] = stations_loc;
        linesStationsForBackground[key] = stations_loc_for_background;
    })
    
    return { linesStations, linesStationsForBackground };
}

