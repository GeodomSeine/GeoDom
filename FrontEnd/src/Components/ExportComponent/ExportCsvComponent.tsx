import ButtonComponent from '../SimpleComponents/ButtonComponent';
import React from 'react';
import Papa from 'papaparse';
import './ExportComponent.scss';
import { DataResponse } from '../../services/api';
import { transformData } from '../../utils/dataTransform';

interface ExportCsvComponentProps {
    exportCsvData: {
        name: string | undefined;
        mode: string;
        data: DataResponse | null;
    }
}

const ExportCsvComponent: React.FC<ExportCsvComponentProps> = ({ exportCsvData }) => {
    const handleExport = () => {
        if (!exportCsvData.data) return;

        const transformedData = transformData(exportCsvData.data, exportCsvData.mode);

        const csv = Papa.unparse(transformedData);
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
                    txt='Exporter en CSV'
                    className='button_container'
                />
            </div>
        </div>
    );
}

export default ExportCsvComponent;