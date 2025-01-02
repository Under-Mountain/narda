export function getRandomNumber(min: number, max: number): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomValue = array[0] / (0xffffffff + 1);
    return Math.floor(randomValue * (max - min + 1)) + min;
}

export function getStats(arr: number[]): { count: number, sum: number, mean: number, median: number, mode: number[] } {
    const count = arr.length
    const sum = arr.reduce((sum, c) => sum + c, 0)
    const mean = getMean(arr);
    const median = getMedian(arr);
    const mode = getMode(arr);

    return { count, sum, mean, median, mode };
}

function getMean(arr: number[]): number {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

function getMedian(arr: number[]): number {
    const sorted = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
}

function getMode(arr: number[]): number[] {
    const frequency: { [key: number]: number } = {};
    let maxFreq = 0;
    let mode: number[] = [];

    arr.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
        if (frequency[num] > maxFreq) {
            maxFreq = frequency[num];
        }
    });

    for (const key in frequency) {
        if (frequency[key] === maxFreq) {
            mode.push(Number(key));
        }
    }

    return mode.length === arr.length ? [] : mode;
}