
export function getTodayFormattedDate(format = 'dash') {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    if (format === 'nodash') {
        return `${year}${month}${day}`;
    }
    return `${year}-${month}-${day}`;
}

export function padStart(string, targetLength, padString) {
    return String(string).padStart(targetLength, padString);
}
