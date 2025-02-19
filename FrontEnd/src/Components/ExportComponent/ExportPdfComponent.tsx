import React from 'react';
import html2canvas from 'html2canvas';
import L, { map, Map } from 'leaflet';
import "leaflet-simple-map-screenshoter";
import jsPDF from 'jspdf';
import './ExportComponent.scss';
import ButtonComponent from '../SimpleComponents/ButtonComponent';

interface ExportPdfComponentProps {
    exportPdfInfo : any;
}

const ExportPdfComponent: React.FC<ExportPdfComponentProps> = ({ exportPdfInfo }) => {
    const chartRef = React.useRef<HTMLCanvasElement>(null);

    const handleExportPDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const elements = [];
        const selectionMapElements = exportPdfInfo.selectionMapElements;
        

        // Capturer la carte Leaflet
        if (selectionMapElements.ref.current) {
            const plugin = (L as any).simpleMapScreenshoter({
                cropImageByInnerWH: true,
                hidden: false,
                preventDownload: true,
                mimeType: "image/png",
                hideElementsWithSelectors: [".leaflet-control-container"],
            }).addTo(selectionMapElements.ref.current);

            try {
                const blob = await plugin.takeScreen("blob", { mimeType: "image/png" });
                const imgUrl = URL.createObjectURL(blob); // Crée une URL temporaire
                pdf.text(selectionMapElements.title, 10, 10);
                pdf.addImage(imgUrl, "PNG", 10, 20, 180, 160);
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
        <div className="export_container">
            <ButtonComponent onClick={handleExportPDF}  txt='Exporter en PDF'/>
        </div>
    );
};

export default ExportPdfComponent;