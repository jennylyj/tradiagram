
export const DiagramHours = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 1, 2, 3, 4, 5, 6];

export const LineDict = {
    'LINE_WN': '西部幹線北段',
    'LINE_WS': '西部幹線南段',
    'LINE_WM': '西部幹線山線',
    'LINE_WSEA': '西部幹線海線',
    'LINE_P': '屏東線',
    'LINE_S': '南迴線',
    'LINE_T': '台東線',
    'LINE_PX': '平溪線',
    'LINE_NW': '內灣線',
    'LINE_LJ': '六家線',
    'LINE_J': '集集線',
    'LINE_SL': '沙崙線',
    'LINE_I': '宜蘭線',
    'LINE_N': '北迴線'
};

// Ensure BASE_URL is correct for GitHub Pages deployment
export const BASE_URL = import.meta.env.BASE_URL === '/' ? '/tradiagram/' : import.meta.env.BASE_URL;

export const DataFiles = {
    Route: `${BASE_URL}references/Route.json`,
    SVG_X_Axis: `${BASE_URL}references/SVG_X_Axis.json`,
    SVG_Y_Axis: `${BASE_URL}references/SVG_Y_Axis.json`,
    OperationLines: `${BASE_URL}references/OperationLines.json`,
    CarKind: `${BASE_URL}references/CarKind.json`
};
