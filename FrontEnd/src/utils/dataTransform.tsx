import { DataResponse, DataPoint } from '../services/api';

export interface DataPointWithPK extends DataPoint {
    pk: number;
}

export interface DataPointWithStrahler extends DataPoint {
    strahler: number;
}

export const transformData = (data: DataResponse, mode: string): (DataPointWithPK | DataPointWithStrahler)[] => {
    let transformedData: (DataPointWithPK | DataPointWithStrahler)[] = [];

    if (mode === 'complet') {
        Object.keys(data).forEach(key => {
            const dataPoints = data[key].data;
            dataPoints.forEach(dataPoint => {
                transformedData.push({strahler: Number(key), ...dataPoint, decade: dataPoint.decade});
            });
        });
    } else if (mode === 'amont-aval') {
        Object.keys(data).forEach(key => {
            const dataPoints = data[key].data;
            dataPoints.forEach(dataPoint => {
                transformedData.push({ pk: Number(key), ...dataPoint,decade: dataPoint.decade });
            });
        });
    }

    return transformedData;
};