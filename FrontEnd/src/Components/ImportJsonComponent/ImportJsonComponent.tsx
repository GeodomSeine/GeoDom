import React, { useState } from 'react';
import './ImportJsonComponent.scss';

const ImportJsonComponent: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
    };

    const handleImport = () => {
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target?.result as string);
                    console.log('Imported JSON data:', jsonData);
                } catch (error) {
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
        </div>
    );
};

export default ImportJsonComponent;