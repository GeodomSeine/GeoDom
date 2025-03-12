import React from 'react';
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
    const handleExport = async () => {
        if(exportConf && exportConf.name !== undefined){
            
            const jsonString = JSON.stringify(exportConf, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement("a");
            downloadLink.href = url;
            downloadLink.download = `${exportConf.name}.json`;

            document.body.appendChild(downloadLink);
            downloadLink.click();

            setTimeout(() => {
                URL.revokeObjectURL(url);
                document.body.removeChild(downloadLink);
            }, 100);
        }
    };
    return (
        <ButtonComponent
            onClick={handleExport}
            txt='Session'
            className='button_container'
        />
    );    
    
};

export default ExportJsonComponent;