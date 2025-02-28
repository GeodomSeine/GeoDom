import React, { useEffect, useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, Image } from '@react-pdf/renderer';
import L from 'leaflet';
import "leaflet-simple-map-screenshoter";
import './ExportComponent.scss';
import ButtonComponent from '../SimpleComponents/ButtonComponent';

async function html2canvas(element: any): Promise<HTMLCanvasElement> {
    const html2canvas = (await import('html2canvas')).default;
    return html2canvas(element);
}

const captureMap = async (mapRef: any) => {
    const plugin = mapRef.current.plugin;
    const blob = await plugin.takeScreen("blob", { mimeType: "image/png" });
    return URL.createObjectURL(blob);
};

const captureChart = async (chartRef: any) => {
    const chartCanvas = await html2canvas(chartRef.current);
    return chartCanvas.toDataURL('image/png');
};

const captureProfilLong = async (profilLong: any) => {
    const chartCanvas = await html2canvas(profilLong.current);
    return chartCanvas.toDataURL('image/png');
};

const ExportPdfDocument = ({ selectionMapElements, selectionMapImageUrl, chartImageUrls, mapImageUrls, profilLongImageUrls }: any) => {

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
                {selectionMapImageUrl && (
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 14, marginBottom: 5 }}>Carte de sélection:</Text>
                        <Image src={selectionMapImageUrl} style={{ width: '80%', height: 'auto' }} />
                    </View>
                )}
            </Page>
            <Page size="A4" style={{ padding: 10 }}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Evolution temporelle</Text>
                {chartImageUrls?.map((url: string, index: number) => (
                    <View key={index} style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 14, marginBottom: 5 }}>Graphique {index + 1}:</Text>
                        <Image src={url} style={{ width: '80%', height: 'auto' }} />
                    </View>
                ))}
            </Page>
            <Page size="A4" style={{ padding: 10 }}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Carte des seuils</Text>
                {mapImageUrls?.map((url: string, index: number) => (
                    <View key={index} style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 14, marginBottom: 5 }}>Carte {index + 1}:</Text>
                        <Image src={url} style={{ width: '80%', height: 'auto' }} />
                    </View>
                ))}
            </Page>
            <Page size="A4" style={{ padding: 10 }}>
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Evolution spatiale</Text>
                {profilLongImageUrls?.map((url: string, index: number) => (
                    <View key={index} style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 14, marginBottom: 5 }}>Profil Long {index + 1}:</Text>
                        <Image src={url} style={{ width: '80%', height: 'auto' }} />
                    </View>
                ))}
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

    const { selectionMapElements, chartElements, mapElements, profilLongElements } = exportPdfInfo;
    const [selectionMapImageUrl, setSelectionMapImageUrl] = useState<string | null>(null);
    const [chartImageUrls, setChartImageUrls] = useState<string[]>([]);
    const [mapImageUrls, setMapImageUrls] = useState<string[]>([]);
    const [profilLongImageUrls, setProfilLongImageUrls] = useState<string[]>([]);
    const [isReady, setIsReady] = useState(0);

    useEffect(() => {
        const captureSelectionMapImage = async () => {
            if (selectionMapImageUrl) {
                URL.revokeObjectURL(selectionMapImageUrl);
                setIsReady(isReady - 1);
                setSelectionMapImageUrl(null);
            }
            if (selectionMapElements.mapRef.current) {
                const mapUrl = await captureMap(selectionMapElements.mapRef);
                setSelectionMapImageUrl(mapUrl);
                setIsReady(isReady + 1);
            }
        };

        captureSelectionMapImage();
    }, [selectionMapElements]);

    useEffect(() => {
        const captureChartImages = async () => {

            if (chartImageUrls.length > 0) {
                chartImageUrls.forEach((url) => {
                    URL.revokeObjectURL(url);
                });

                setIsReady(isReady - 1);
                setChartImageUrls([]);
            }

            const chartUrls = await Promise.all(
                chartElements.chartRefs.current.map(async (chartRef: any) => {
                    if (chartRef.current) {
                        return await captureChart(chartRef);
                    }
                    return null;
                })
            );
            setChartImageUrls(chartUrls.filter((url) => url !== null) as string[]);
            setIsReady(isReady + (chartUrls.length > 0 ? 1 : 0));
        };

        captureChartImages();
    }, [chartElements]);

    useEffect(() => {
        const captureMapImages = async () => {
            if (mapImageUrls.length > 0) {
                mapImageUrls.forEach((url) => {
                    URL.revokeObjectURL(url);
                });
                setIsReady(isReady - 1);
                setMapImageUrls([]);
            }
            const mapUrls = await Promise.all(
                mapElements.mapRefs.current.map(async (mapRef: any) => {
                    if (mapRef.current) {
                        return await captureMap(mapRef);
                    }
                    return null;
                })
            );
            setMapImageUrls(mapUrls.filter((url) => url !== null) as string[]);
            setIsReady(isReady + (mapUrls.length > 0 ? 1 : 0));
        };

        captureMapImages();
    }, [mapElements]);

    useEffect(() => {
        const captureProfilLongImages = async () => {
            if (profilLongImageUrls.length > 0) {
                profilLongImageUrls.forEach((url) => {
                    URL.revokeObjectURL(url);
                });
                setIsReady(isReady - 1);
                setProfilLongImageUrls([]);
            }
            const profilLongUrls = await Promise.all(
                profilLongElements.profilLongRefs.current.map(async (profilLong: any) => {
                    if (profilLong.current) {
                        return await captureProfilLong(profilLong);
                    }
                    return null;
                })
            );
            setProfilLongImageUrls(profilLongUrls.filter((url) => url !== null) as string[]);
            setIsReady(isReady + (profilLongUrls.length > 0 ? 1 : 0));
        };

        captureProfilLongImages();
    }, [profilLongElements]);

    return (
        <div className="export_container">
            {true ? (
                <PDFDownloadLink
                    document={<ExportPdfDocument
                        selectionMapElements={selectionMapElements}
                        selectionMapImageUrl={selectionMapImageUrl}
                        chartImageUrls={chartImageUrls}
                        mapImageUrls={mapImageUrls}
                        profilLongImageUrls={profilLongImageUrls}
                    />}
                    fileName={`export_${exportPdfInfo.selectionMapElements.program_name}.pdf`}
                >
                    <ButtonComponent onClick={() => { }} txt={'Les données au format PDF'} />
                </PDFDownloadLink>
            ) : (
                <ButtonComponent onClick={() => { }} txt={'Préparation du PDF...'} disabled={true} />
            )}
        </div>
    );
};

export default ExportPdfComponent;