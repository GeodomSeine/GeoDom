import React from 'react';
import html2canvas from 'html2canvas';
import L, { Map } from 'leaflet';
import jsPDF from 'jspdf';

interface ExportPdfComponentProps {
    mapRef: React.RefObject<Map>; // Référence vers le MapContainer
    chartRef: React.RefObject<HTMLDivElement>; // Référence vers le graphique
}

const ExportPdfComponent: React.FC<ExportPdfComponentProps> = ({ mapRef, chartRef }) => {
    const handleExportPDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const elements = [];

        // Capturer la carte Leaflet
        if (mapRef.current) {
            const plugin = (L as any).simpleMapScreenshoter({
                cropImageByInnerWH: true,
                hidden: true,
                preventDownload: true,
                mimeType: "image/png",
                hideElementsWithSelectors: [".leaflet-control-container"],
            }).addTo(mapRef.current);

            try {
                const blob = await plugin.takeScreen("blob", { mimeType: "image/png" });
                const imgUrl = URL.createObjectURL(blob); // Crée une URL temporaire
                pdf.addImage(imgUrl, "PNG", 0, 0, 297, 210);
                URL.revokeObjectURL(imgUrl); // Libère la mémoire

            } catch (e) {
                console.error("Erreur de capture:", e);
            }
        }

        // Capturer le graphique Chart.js
        if (chartRef.current) {
            const chartCanvas = await html2canvas(chartRef.current);
            elements.push({ img: chartCanvas.toDataURL('image/png'), title: 'Graphique' });
            chartCanvas.remove(); // Free memory by removing the canvas element
        }

        // Ajouter les éléments au PDF
        elements.forEach((element, index) => {
            if (index > 0) pdf.addPage();
            pdf.text(element.title, 10, 10);
            pdf.addImage(element.img, 'PNG', 10, 20, 180, 160);
        });

        // Télécharger le PDF
        pdf.save("export.pdf");


    };

    return (
        <div>
            <button onClick={handleExportPDF}>Exporter en PDF</button>
        </div>
    );
};

export default ExportPdfComponent;