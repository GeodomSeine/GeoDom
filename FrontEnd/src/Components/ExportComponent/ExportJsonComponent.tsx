import React from 'react';
import './ExportComponent.scss';
import ButtonComponent from '../SimpleComponents/ButtonComponent';

interface ExportJsonComponentProps {
    exportConf:{
        name: string | undefined;
        selected : string | null;
        hydro_id_start : number | null;
        hydro_id_end : number | null;
        variables: string[]; 
        scenarios: number[];
        decades: number[]
        selectedSliderValue: number;
    }
}

const ExportJsonComponent: React.FC<ExportJsonComponentProps> = ({ exportConf }) => {
    const handleExport = () => {
        if(exportConf && exportConf.name !== undefined){
            const jsonString = JSON.stringify(exportConf, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement("a");
            downloadLink.href = url;
            downloadLink.download = exportConf.name + ".json";
            downloadLink.click();
            URL.revokeObjectURL(url);
        }
    };
    return (
        <div className="export_container json">
            <div className='export_body'>
                <ButtonComponent
                onClick={handleExport}
                txt='Exporter en JSON'
                className='button_container'
                />
            </div>
        </div>
    );
    
};

export default ExportJsonComponent;