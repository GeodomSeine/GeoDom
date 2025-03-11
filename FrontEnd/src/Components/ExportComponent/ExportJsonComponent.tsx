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

            // Vérifier si l'API `showSaveFilePicker` est supportée
            if ((window as any).showSaveFilePicker) {
                try {
                    const fileHandle = await (window as any).showSaveFilePicker({
                        suggestedName: exportConf.name + ".json",
                        types: [{ description: "Fichier JSON", accept: { "application/json": [".json"] } }],
                    });

                    const writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    return;
                } catch (error) {
                    console.error("Erreur lors de l'enregistrement :", error);
                }
            }

            // Cas Firefox & Safari : Ouvrir le fichier dans un nouvel onglet
            const url = URL.createObjectURL(blob);
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            
            if (isSafari || navigator.userAgent.includes("Firefox")) {
                const newTab = window.open(url, "_blank");
                if (!newTab) {
                    alert("Veuillez autoriser les pop-ups pour télécharger le fichier.");
                }
                setTimeout(() => URL.revokeObjectURL(url), 10000);
                return;
            }

            // Cas par défaut (Chrome & Firefox) ➝ Téléchargement avec boîte de dialogue
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