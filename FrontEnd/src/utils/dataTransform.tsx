import { DataResponse, DataPoint, DonutsDataResponse, Scenario } from '../services/api';

export interface DataPointWithPK extends DataPoint {
    pk: number;
}

export interface DataPointWithStrahler extends DataPoint {
    strahler: number;
}

export const transformData = (PynutsData: DataResponse, DonutsData: DonutsDataResponse, DonutsScenario:Scenario[] ,mode: string): (DataPointWithPK | DataPointWithStrahler)[] => {
    let transformedData: (DataPointWithPK | DataPointWithStrahler)[] = [];

    if (mode === 'complet') {
        Object.keys(PynutsData).forEach(key => {
            const dataPoints = PynutsData[key].data;
        
                dataPoints.forEach(dataPoint => {
                    const transformedPoint: { [key: string]: any, strahler: number, decade: number } = { strahler: Number(key), ...dataPoint, decade: dataPoint.decade };
                    if (DonutsData[key]) {
                        Object.keys(DonutsData[key]).forEach(variable => {
                            DonutsData[key][variable][dataPoint.decade]?.forEach(scenarioValue => {
                                const year = DonutsScenario.find(scenario => scenario.id === scenarioValue.scenario)?.year;
                                transformedPoint[`${variable} (Observation ${year} P5)`] = scenarioValue.p5;
                                transformedPoint[`${variable} (Observation ${year} P50)`] = scenarioValue.p50;
                                transformedPoint[`${variable} (Observation ${year} P90)`] = scenarioValue.p90;
                            });
                        });
                    }
                    transformedData.push(transformedPoint);
                });
          
        });
    } else if (mode === 'amont-aval') {
        Object.keys(PynutsData).forEach(key => {
            const dataPoints = PynutsData[key].data;
                dataPoints.forEach(dataPoint => {
                    const transformedPoint: { [key: string]: any, pk: number, decade: number } = { pk: Number(key), ...dataPoint, decade: dataPoint.decade };
                    if (DonutsData[key]) {
                        Object.keys(DonutsData[key]).forEach(variable => {
                            DonutsData[key][variable][dataPoint.decade]?.forEach(scenarioValue => {
                                const year = DonutsScenario.find(scenario => scenario.id === scenarioValue.scenario)?.year;
                                transformedPoint[`${variable} (Observation ${year} P5)`] = scenarioValue.p5;
                                transformedPoint[`${variable} (Observation ${year} P50)`] = scenarioValue.p50;
                                transformedPoint[`${variable} (Observation ${year} P90)`] = scenarioValue.p90;
                            });
                        });
                    }
                    transformedData.push(transformedPoint);
                });
            }
        );
    }
    return transformedData;
};