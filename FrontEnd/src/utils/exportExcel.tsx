import * as XLSX from 'xlsx';
import { ProgramVariable } from '../services/api';
import { DataPointWithPK, DataPointWithStrahler } from './dataTransform';

export const exportToExcel = (data: (DataPointWithPK | DataPointWithStrahler)[], variables: ProgramVariable[], fileName: string) => {
    const workbook = XLSX.utils.book_new();

    const sheetsData: { [key: string]: any[] } = {};

    variables.forEach(variable => {
        sheetsData[variable.var_code] = [];
    });

    data.forEach(dataPoint => {
        console.log("dataPoint");
        console.log(dataPoint);
        variables.forEach(variable => {
            console.log("variable");
            console.log(variable);
            const sheetDataPoint: any = { key: dataPoint.key, decade: dataPoint.decade };
            sheetDataPoint[variable.var_code] = dataPoint;
            sheetsData[variable.var_code].push(sheetDataPoint);
        });
    });

    Object.keys(sheetsData).forEach(sheetName => {
        const sheet = XLSX.utils.json_to_sheet(sheetsData[sheetName]);
        XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    });

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};