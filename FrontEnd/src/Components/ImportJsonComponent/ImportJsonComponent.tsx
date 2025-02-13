import React, { useState } from 'react';
import './ImportJsonComponent.scss';

interface ImportJsonComponentProps {
    visualizationData: { name: string; variables: string[] }[];
}

const ImportJsonComponent: React.FC<ImportJsonComponentProps> = ({ visualizationData }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
        setErrorMessage(null);
    };

    const handleImport = () => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target?.result as string);
                    const requiredKeys = ["name", "selected", "hydro_id_start", "hydro_id_end", "variables", "scenarios"];
                    const missingKeys = requiredKeys.filter(key => !(key in jsonData));
                    if (missingKeys.length > 0) {
                        setErrorMessage(`Erreur: Les clés suivantes sont manquantes dans le fichier JSON: ${missingKeys.join(", ")}`);
                        return;
                    }
                    if (jsonData.name === "") {
                        setErrorMessage("Erreur: Le nom de la visualisation est vide");
                        return;
                    }
                    const visualization = visualizationData.find(v => v.name === jsonData.name);
                    if (!visualization) {
                        setErrorMessage(`Erreur: Aucune visualisation trouvée avec le nom '${jsonData.name}'`);
                        return;
                    }
                    const invalidVariables = jsonData.variables.filter((variable: string) => !visualization.variables.includes(variable));
                    if (invalidVariables.length > 0) {
                        setErrorMessage(`Erreur: Les variables suivantes sont incorrectes pour la visualisation '${jsonData.name}': ${invalidVariables.join(", ")}`);
                        return;
                    }
                    if(jsonData.scenarios.filter((scenario: number) => scenario < 0).length > 0){
                        setErrorMessage(`Erreur: Les scenarios suivants sont incorrects pour la visualisation '${jsonData.name}': ${jsonData.scenarios.filter((scenario: number) => scenario < 0).join(", ")}`);
                        return;
                    }
                } catch (error) {
                    setErrorMessage('Erreur lors de l\'importation du fichier JSON');
                    console.error('Error parsing JSON:', error);
                }
            };
            reader.readAsText(selectedFile);
        }
    };

    return (
        <div className="import-json-popup">
            <h2>Importer un fichier JSON</h2>
            <input type="file" accept=".json" onChange={handleFileChange} />
            <button onClick={handleImport}>Importer JSON</button>
            {errorMessage && <h2 style={{ color: 'red' }}>{errorMessage}</h2>}
        </div>
    );
};

export default ImportJsonComponent;