import ButtonComponent from '../SimpleComponents/ButtonComponent';
import React from 'react';
import Papa from 'papaparse';
import './ExportComponent.scss';
import { DataResponse, DonutsDataResponse, Scenario } from '../../services/api';
import { transformData } from '../../utils/dataTransform';
import JSZip from 'jszip';

interface ExportCsvComponentProps {
    exportCsvData: {
        name: string | undefined;
        mode: string;
        pynutsData: DataResponse | null;
        donutsData: DonutsDataResponse | null;
        variables: string[]; 
        scenarios: Scenario[]
    }
}

const ExportCsvComponent: React.FC<ExportCsvComponentProps> = ({ exportCsvData }) => {
    const handleExport = async () => {
        if (!exportCsvData.pynutsData || !exportCsvData.donutsData) return;

        const zip = new JSZip();

        const transformedData = transformData(exportCsvData.pynutsData, exportCsvData.donutsData, exportCsvData.scenarios, exportCsvData.mode);
        const csv = Papa.unparse(transformedData);

        zip.file(`${exportCsvData.name}.csv`, csv);
        
        const metadata = {
            name: exportCsvData.name,
            date: new Date().toISOString(),
            variables: exportCsvData.variables,
            annees: exportCsvData.scenarios.map((s) => s.year),
        };

        zip.file("metadata.json", JSON.stringify(metadata, null, 2));       

        const zipBlob = await zip.generateAsync({ type: "blob" });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${exportCsvData.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="export_container CSV">
            <div className='export_body'>
                <ButtonComponent
                    onClick={handleExport}
                    txt='CSV'
                    className='button_container'
                />
            </div>
        </div>
    );
}

export default ExportCsvComponent;