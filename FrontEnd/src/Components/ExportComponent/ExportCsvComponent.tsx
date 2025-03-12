import ButtonComponent from '../SimpleComponents/ButtonComponent';
import React from 'react';
import Papa from 'papaparse';
import { DataResponse, DonutsDataResponse, getGeoPackage, ProgramVariable, Scenario } from '../../services/api';
import { transformData } from '../../utils/dataTransform';
import JSZip from 'jszip';

interface ExportCsvComponentProps {
    exportCsvData: {
        program: string;
        id_hyd_start: number | null;
        id_hyd_end: number | null;
        mode: string;
        pynutsData: DataResponse | null;
        donutsData: DonutsDataResponse | null;
        variables: ProgramVariable[]; 
        scenarios: Scenario[]
    }
}

const ExportCsvComponent: React.FC<ExportCsvComponentProps> = ({ exportCsvData}) => {
    const handleExport = async () => {
        if (!exportCsvData.program || !exportCsvData.pynutsData || !exportCsvData.donutsData || exportCsvData.variables.length==0) return;

        const zip = new JSZip();
        
        //CSV
        for(let i = 0; i < exportCsvData.variables.length; i++){
            const variable = exportCsvData.variables[i].var_code;
            const transformedData = transformData(exportCsvData.pynutsData, exportCsvData.donutsData, exportCsvData.scenarios, variable, exportCsvData.mode);
            const csv = Papa.unparse(transformedData);
            zip.file(`${exportCsvData.program}_${variable}.csv`, csv);
        }        
        //Metadata
        const metadata = {
            name: exportCsvData.program,
            date: new Intl.DateTimeFormat('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Europe/Paris'
            }).format(new Date()),
            variables: exportCsvData.variables.map(variable => `${variable.var_code} (${variable.unit_short})`),
            year: exportCsvData.scenarios.map((s) => s.year),
        };
        zip.file("metadata.json", JSON.stringify(metadata, null, 2));

        // GeoPackage
        if(exportCsvData.id_hyd_start != null && exportCsvData.id_hyd_end != null) {
            try {
                const geopackage = await getGeoPackage(exportCsvData.program, exportCsvData.id_hyd_start, exportCsvData.id_hyd_end);
                zip.file(`${exportCsvData.program}_amont_aval.gpkg`, geopackage);
            } catch (error) {
                console.error("Error fetching GeoPackage:", error);
            }
        }        
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${exportCsvData.program}.zip`);
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
