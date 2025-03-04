import React, { useState } from "react";
import ButtonComponent from "../SimpleComponents/ButtonComponent";

interface ExportPdfComponentProps {
    exportPdfInfo: any;
}

const ExportPdfComponent: React.FC<ExportPdfComponentProps> = ({ exportPdfInfo }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generatePDF = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/generate-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ program_name: exportPdfInfo.selectionMapElements.program_name})  
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la génération du PDF");
            }

            // Récupérer le fichier PDF sous forme de blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Créer un lien de téléchargement et cliquer dessus
            const a = document.createElement("a");
            a.href = url;
            a.download = `export_${exportPdfInfo.selectionMapElements.program_name}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="export_container">
            <ButtonComponent onClick={generatePDF} txt={loading ? "..." : "PDF"} disabled={loading} />
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default ExportPdfComponent;
