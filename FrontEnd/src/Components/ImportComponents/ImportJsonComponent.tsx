import React, { useState } from "react";
import "./ImportComponent.scss";
import ButtonComponent from "../SimpleComponents/ButtonComponent";
import { useNavigate } from "react-router";
import InputComponent from "../SimpleComponents/InputComponent";

interface ImportJsonComponentProps {
    visualizationData: { name: string; variables: string[] }[];
}

const ImportJsonComponent: React.FC<ImportJsonComponentProps> = ({ visualizationData }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

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
                    const requiredKeys = ["name", "selected", "hydro_id_start", "hydro_id_end", "variables", "scenarios", "decades", "selectedSliderValue"];
                    const missingKeys = requiredKeys.filter(key => !(key in jsonData));
                    if (missingKeys.length > 0) {
                        setErrorMessage(`Erreur: Les clés suivantes sont manquantes dans le fichier JSON: ${missingKeys.join(", ")}`);
                        return;
                    }

                    if (jsonData.name === "") {
                        setErrorMessage("Erreur: Le nom de la visualisation est vide");
                        return;
                    }

                    if (jsonData.variables.length === 0 || jsonData.scenarios.length === 0) {
                        setErrorMessage("Erreur: Les variables ou scenarios sont vides");
                        return;
                    }

                    if (jsonData.decades.length !== 2) {
                        setErrorMessage(`Erreur: Le nombre de décennies est incorrect pour la visualisation '${jsonData.name}': ${jsonData.decades.length}`);
                        return;
                    }

                    if (jsonData.decades[0] <= 0 || jsonData.decades[1] > 36 || jsonData.decades[0] > jsonData.decades[1]) {
                        setErrorMessage(`Erreur: Les décennies sont incorrectes pour la visualisation '${jsonData.name}': ${jsonData.decades[0]} > ${jsonData.decades[1]}`);
                        return;
                    }

                    if (jsonData.selectedSliderValue <= 0) {
                        setErrorMessage(`Erreur: La valeur du slider est incorrecte pour la visualisation '${jsonData.name}': ${jsonData.selectedSliderValue}`);
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
                    if (jsonData.scenarios.filter((scenario: number) => scenario < 0).length > 0) {
                        setErrorMessage(`Erreur: Les scenarios suivants sont incorrects pour la visualisation '${jsonData.name}': ${jsonData.scenarios.filter((scenario: number) => scenario < 0).join(", ")}`);
                        return;
                    }

                    localStorage.setItem("confImportation", JSON.stringify(jsonData));
                    navigate(`/${jsonData.name}`);
                } catch (error) {
                    setErrorMessage('Erreur lors de l\'importation du fichier JSON');
                    console.error('Error parsing JSON:', error);
                }
            };
            reader.readAsText(selectedFile);
        }
    };

    return (
        <div className="import_container json">
            <div className="import_body">
                <InputComponent
                    type="file"
                    onChange={handleFileChange}
                    selectedFile={selectedFile?.name}
                />
                {selectedFile && (
                    <ButtonComponent onClick={handleImport} txt="Valider" />
                )}
            </div>
            {errorMessage && (
                <div className="import_footer">
                    <p style={{ color: "var(--danger-color)" }}>{errorMessage}</p>
                </div>
            )}
        </div>
    );
};

export default ImportJsonComponent;
