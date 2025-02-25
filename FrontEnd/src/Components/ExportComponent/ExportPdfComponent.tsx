import React, { useEffect } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, Image } from '@react-pdf/renderer';
import L from 'leaflet';
import "leaflet-simple-map-screenshoter";
import './ExportComponent.scss';
import ButtonComponent from '../SimpleComponents/ButtonComponent';

const captureMap = async (mapRef: any) => {
    const plugin = mapRef.current.plugin;
    const blob = await plugin.takeScreen("blob", { mimeType: "image/png" });
    return URL.createObjectURL(blob);
};

const captureChart = async (chartRef: any) => {
    const chartCanvas = await html2canvas(chartRef.current);
    return chartCanvas.toDataURL('image/png');
};

async function html2canvas(element: any): Promise<HTMLCanvasElement> {
    // Assuming html2canvas is imported from a library
    const html2canvas = (await import('html2canvas')).default;
    return html2canvas(element);
}

const ExportPdfDocument = ({ exportPdfInfo }: any) => {
    const { selectionMapElements, chartElements } = exportPdfInfo;
    const [mapImageUrl, setMapImageUrl] = React.useState<string | null>(null);
    const [chartImageUrl, setChartImageUrl] = React.useState<string | null>(null);

    useEffect(() => {
        const captureImages = async () => {
            if (selectionMapElements.mapRef.current) {
                const mapUrl = await captureMap(selectionMapElements.mapRef);
                setMapImageUrl(mapUrl);
            }
            if (chartElements.testRef.current) {
                const chartUrl = await captureChart(chartElements.testRef);
                setChartImageUrl(chartUrl);
            }
        };
        captureImages();
    }, [selectionMapElements.mapRef, chartElements.testRef]);

    return (
        <Document>
            <Page size="A4" style={{ padding: 10 }}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Capsule : {selectionMapElements.program_name}</Text>
                <Text style={{ fontSize: 12, marginBottom: 10 }}>Date: {new Date().toLocaleString()}</Text>
                <Text style={{ fontSize: 14, marginBottom: 5 }}>Variables sélectionnées:</Text>
                {selectionMapElements.selectedVariables.map((variable: any, index: number) => (
                    <Text key={index} style={{ fontSize: 12, marginBottom: 2 }}>
                        - {variable.var_code} : {variable.var_name}
                    </Text>
                ))}
                <Text style={{ fontSize: 14, marginTop: 10, marginBottom: 5 }}>Scénarios sélectionnés:</Text>
                {selectionMapElements.selectedScenarios.map((scenario: any, index: number) => (
                    <Text key={index} style={{ fontSize: 12, marginBottom: 2 }}>
                        - {scenario.year} : {scenario.description}
                    </Text>
                ))}
                {mapImageUrl && (
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 14, marginBottom: 5 }}>Carte de sélection:</Text>
                        <Image src={mapImageUrl} style={{ width: '80%', height: 'auto' }} />
                    </View>
                )}
               
            </Page>
            <Page size="A4" style={{ padding: 10 }}>
                {chartImageUrl && (
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 14, marginBottom: 5 }}>Graphique:</Text>
                        <Image src={chartImageUrl} style={{ width: '80%', height: 'auto' }} />
                    </View>
                )}
            </Page>
        </Document>
    );
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

    return (
        <div className="export_container">
            <PDFDownloadLink
                document={<ExportPdfDocument exportPdfInfo={exportPdfInfo} />}
                fileName={`export_${exportPdfInfo.selectionMapElements.program_name}.pdf`}
            >
                <ButtonComponent onClick={() => {}} txt={'Exporter en PDF'} />
            </PDFDownloadLink>
        </div>
    );
};

export default ExportPdfComponent;

