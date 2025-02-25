import React, { useEffect } from 'react';
import html2canvas from 'html2canvas';
import L from 'leaflet';
import "leaflet-simple-map-screenshoter";
import jsPDF from 'jspdf';
import './ExportComponent.scss';
import ButtonComponent from '../SimpleComponents/ButtonComponent';

// let marginX = 10;

const getMapDimensionsFromBounds = (map: L.Map) => {
    const bounds = map.getBounds();
    const southWest = map.latLngToContainerPoint(bounds.getSouthWest());
    const northEast = map.latLngToContainerPoint(bounds.getNorthEast());

    const mapWidth = Math.abs(northEast.x - southWest.x);
    const mapHeight = Math.abs(southWest.y - northEast.y); // Y inversé

    return { mapWidth, mapHeight };
};


const addMapsToPDF = async (pdf: jsPDF, mapElements: any) => {
    const { mapRefs } = mapElements;

    if (mapRefs.current) {
        let imagesOnPage = 0;

        // Ajouter la première page avec le titre
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.text("Carte des seuils", 105, 20, { align: "center" }); // Centré en haut

        for (let index = 0; index < mapRefs.current.length; index++) {
            const mapRef = mapRefs.current[index];
            const plugin = mapRef.current.plugin;

            try {
                const blob = await plugin.takeScreen("blob", { mimeType: "image/png" });
                const imgUrl = URL.createObjectURL(blob);

                // Calculer les dimensions selon les bounds
                const { mapWidth, mapHeight } = getMapDimensionsFromBounds(mapRef.current);
                const aspectRatio = mapWidth / mapHeight;

                // Dimensions de la page PDF (A4 : 210x297 mm)
                const pageWidth = 180; // Légères marges
                const pageHeight = 260; // Laisser de l'espace pour le titre

                // Espace disponible pour 4 cartes (2x2)
                const gridCols = 2;
                const gridRows = 2;
                const cellWidth = pageWidth / gridCols;
                const cellHeight = pageHeight / gridRows;

                // Adapter l'image à la cellule en conservant les proportions
                let imgWidth = cellWidth;
                let imgHeight = cellWidth / aspectRatio;

                if (imgHeight > cellHeight) {
                    imgHeight = cellHeight;
                    imgWidth = cellHeight * aspectRatio;
                }

                // Calcul de la position (grille 2x2)
                const col = imagesOnPage % gridCols;
                const row = Math.floor(imagesOnPage / gridCols);
                const imgX = 15 + col * cellWidth + (cellWidth - imgWidth) / 2; // Centrage horizontal
                const imgY = 30 + row * cellHeight + (cellHeight - imgHeight) / 2; // Centrage vertical sous le titre

                // Ajouter l'image
                pdf.addImage(imgUrl, "PNG", imgX, imgY, imgWidth, imgHeight);

                URL.revokeObjectURL(imgUrl);

                imagesOnPage++;

            } catch (e) {
                console.error(`Erreur de capture pour la carte ${index + 1}:`, e);
            }
        }
    }
};

const getPlugin = (mapRef: any) => {
    return (L as any).simpleMapScreenshoter({
      cropImageByInnerWH: true,
      hidden: false,
      preventDownload: false,
      mimeType: "image/png",
      hideElementsWithSelectors: [".leaflet-control-container"],
    }).addTo(mapRef.current);
  };
  
  interface ExportPdfComponentProps {
    exportPdfInfo: any;
  }
  
  const ExportPdfComponent: React.FC<ExportPdfComponentProps> = ({ exportPdfInfo }) => {
    useEffect(() => {
      const mapRefs = exportPdfInfo.mapElements.mapRefs;
  
      mapRefs.current.forEach((mapRef: any) => {
        if (mapRef.current && !mapRef.current.plugin) {
            mapRef.current.plugin = getPlugin(mapRef);
          }
      });
      
    }, [exportPdfInfo.mapElements.mapRefs]);

    useEffect(() => {
        const mapRef = exportPdfInfo.selectionMapElements.mapRef;
    
        if (mapRef.current && !mapRef.current.plugin) {
          mapRef.current.plugin = getPlugin(mapRef);
        }
      }, [exportPdfInfo.selectionMapElements.mapRef]);

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
        if (selectionMapElements.mapRef.current && selectionMapElements.mapRef.current.plugin) {
            const plugin = selectionMapElements.mapRef.current.plugin;

            try {
                const blob = await plugin.takeScreen("blob", { mimeType: "image/png" });
                const imgUrl = URL.createObjectURL(blob); // Crée une URL temporaire
                // Utiliser les bounds pour calculer le ratio
                const { mapWidth, mapHeight } = getMapDimensionsFromBounds(selectionMapElements.mapRef.current);
                const aspectRatio = mapWidth / mapHeight;

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

        // Capturer les cartes de seuil
        const { mapElements } = exportPdfInfo;
        addMapsToPDF(pdf, mapElements);

        // Ajouter les éléments au PDF
        elements.forEach((element, index) => {
            if (index > 0) pdf.addPage();
            pdf.text(element.title, 10, 10);
            pdf.addImage(element.img, 'PNG', 10, 20, 180, 160);
        });

        // Télécharger le PDF
        pdf.save(`export_${selectionMapElements.program_name}.pdf`);


    };

    return (
        <div className="export_container">
            <ButtonComponent onClick={handleExportPDF} txt='Exporter en PDF' />
        </div>
    );
};

export default ExportPdfComponent;
