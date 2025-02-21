import React from 'react';
import html2canvas from 'html2canvas';
import L from 'leaflet';
import "leaflet-simple-map-screenshoter";
import jsPDF from 'jspdf';
import './ExportComponent.scss';
import ButtonComponent from '../SimpleComponents/ButtonComponent';

const getMapDimensionsFromBounds = (map: L.Map) => {
    const bounds = map.getBounds();
    const southWest = map.latLngToContainerPoint(bounds.getSouthWest());
    const northEast = map.latLngToContainerPoint(bounds.getNorthEast());

    const mapWidth = Math.abs(northEast.x - southWest.x);
    const mapHeight = Math.abs(southWest.y - northEast.y); // Y inversé

    return { mapWidth, mapHeight };
};

interface ExportPdfComponentProps {
    exportPdfInfo: any;
}

const ExportPdfComponent: React.FC<ExportPdfComponentProps> = ({ exportPdfInfo }) => {

    const handleExportPDF = async () => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const elements = [];

        const { selectionMapElements } = exportPdfInfo;
        const { selectedVariables } = selectionMapElements; // liste des variables sélectionnées
        const { selectedScenarios } = selectionMapElements; // liste des scénarios sélectionnés

        // Ajouter le titre
        pdf.setFontSize(18);
        pdf.text(`Capsule : ${selectionMapElements.program_name}`, 10, 20);

        // Ajouter la date et l'heure actuelles
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleString();
        pdf.setFontSize(12);
        pdf.text(`Date: ${formattedDate}`, 10, 30);

        // Ajouter les variables sélectionnées
        pdf.setFontSize(14);
        pdf.text("Variables sélectionnées:", 10, 40);
        pdf.setFontSize(12);
        selectedVariables.forEach((variable: any, index: number) => {
            pdf.text(`-  ${variable.var_code} : ${variable.var_name}`, 10, 50 + index * 7);
        });

        // Ajouter les scénarios sélectionnés
        const scenarioStartY = 50 + selectionMapElements.selectedVariables.length * 7 + 10;
        pdf.setFontSize(14);
        pdf.text("Scénarios sélectionnés:", 10, scenarioStartY);
        pdf.setFontSize(12);
        selectedScenarios.forEach((scenario: any, index: number) => {
            pdf.text(`- ${scenario.year} : ${scenario.description}`, 10, scenarioStartY + 10 + index * 7);
        });

        // Capturer la carte de sélection Leaflet
        if (selectionMapElements.mapRef.current) {
            const plugin = (L as any).simpleMapScreenshoter({
                cropImageByInnerWH: true,
                hidden: false, // Icon screenshot visible
                preventDownload: true,
                mimeType: "image/png",
                hideElementsWithSelectors: [".leaflet-control-container"],
            }).addTo(selectionMapElements.mapRef.current);

            try {
                const blob = await plugin.takeScreen("blob", { mimeType: "image/png" });
                const imgUrl = URL.createObjectURL(blob); // Crée une URL temporaire
                // Utiliser les bounds pour calculer le ratio
                const { mapWidth, mapHeight } = getMapDimensionsFromBounds(selectionMapElements.mapRef.current);
                const aspectRatio = mapWidth / mapHeight;
                console.log("Dimensions de la carte:", mapWidth, mapHeight, aspectRatio);

                // Définir les dimensions de l'image en conservant les proportions (certain cas encore buggé..)
                const imgMaxWidth = 180;
                const imgWidth = imgMaxWidth;
                const imgHeight = imgMaxWidth / aspectRatio;
                // Calculer la position pour l'image
                const imgY = scenarioStartY + 10 + selectionMapElements.selectedScenarios.length * 7 + 20;
                pdf.addImage(imgUrl, "PNG", 10, imgY, imgWidth, imgHeight);

                URL.revokeObjectURL(imgUrl);

            } catch (e) {
                console.error("Erreur de capture:", e);
            }
        }

        // Capturer le graphique Chart.js
        const chartRef = exportPdfInfo.chartElements.testRef;
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
            <ButtonComponent onClick={handleExportPDF} txt='Exporter en PDF' />
        </div>
    );
};

export default ExportPdfComponent;