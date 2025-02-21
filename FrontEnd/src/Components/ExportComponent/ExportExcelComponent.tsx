import ButtonComponent from '../SimpleComponents/ButtonComponent';
import React from 'react';
import './ExportComponent.scss';
import { DataResponse, ProgramVariable } from '../../services/api';
import { transformData } from '../../utils/dataTransform.tsx';
import { exportToExcel } from '../../utils/exportExcel';

interface ExportExcelComponentProps {
    exportExcelData: {
        name: string | undefined;
        mode: string;
        data: DataResponse | null;
        selectedVariables: ProgramVariable[];
    }
}

const ExportExcelComponent: React.FC<ExportExcelComponentProps> = ({ exportExcelData }) => {
    const handleExport = () => {
        if (!exportExcelData.data || !exportExcelData.name || !exportExcelData.selectedVariables) return;
        
        const transformedData = transformData(exportExcelData.data, exportExcelData.mode);
        exportToExcel(transformedData, exportExcelData.selectedVariables, exportExcelData.name);
    }

    return (
        <div className="export_container CSV">
            <div className='export_body'>
                <ButtonComponent
                    onClick={handleExport}
                    txt='Exporter en Excel'
                    className='button_container'
                />
            </div>
        </div>
    );
}

export default ExportExcelComponent;