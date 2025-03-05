import { DataResponse, DataPoint, DonutsDataResponse, Scenario } from '../services/api';

export interface DataPointWithPK extends DataPoint {
    pk: number;
}

export interface DataPointWithStrahler extends DataPoint {
    strahler: number;
}

export const transformData = (
    PynutsData: DataResponse,
    DonutsData: DonutsDataResponse,
    DonutsScenario: Scenario[],
    selectedVariables: string,
    mode: string
): (DataPointWithPK | DataPointWithStrahler)[] => {
    let transformedData: (DataPointWithPK | DataPointWithStrahler)[] = [];

    Object.keys(PynutsData).forEach(key => {
        const dataPoints = PynutsData[key].data;

        dataPoints.forEach((dataPoint: DataPoint) => {
            let transformedPoint: { [key: string]: any } = {
                decade: dataPoint.decade,
                ...(mode === 'complet' ? { strahler: Number(key) } : { pk: (key) })
            };

            Object.keys(dataPoint).forEach(variable => {
                if (variable.toLowerCase().startsWith(selectedVariables.toLowerCase())) {
                    transformedPoint[variable] = dataPoint[variable];
                }
            });

            if (DonutsData[key]) {
                Object.keys(DonutsData[key]).forEach(variable => {
                    if (!variable.toLowerCase().startsWith(selectedVariables.toLowerCase())) return;

                    DonutsData[key][variable][dataPoint.decade]?.forEach(scenarioValue => {
                        const scenario = DonutsScenario.find(s => s.id === scenarioValue.scenario);
                        if (scenario) {
                            transformedPoint[`${variable} (Observation ${scenario.year} P5)`] = scenarioValue.p5;
                            transformedPoint[`${variable} (Observation ${scenario.year} P50)`] = scenarioValue.p50;
                            transformedPoint[`${variable} (Observation ${scenario.year} P90)`] = scenarioValue.p90;
                        }
                    });
                });
            }

            transformedData.push(transformedPoint as DataPointWithPK | DataPointWithStrahler);
        });
    });

    return transformedData;
};
