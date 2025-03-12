import React, { useEffect, useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import "leaflet-simple-map-screenshoter";
import ButtonComponent from '../SimpleComponents/ButtonComponent';
import html2canvas from 'html2canvas';

const captureMap = async (mapRef: any) => {
    const overlayPane = mapRef.current.getPane("overlayPane"); // Pane où Leaflet met le canvas
    const canvas = overlayPane?.querySelector("canvas");
    const capturePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Capture timed out'));
        }, 10000);
        canvas.toBlob((blob: any) => {
            clearTimeout(timeout);
            resolve(URL.createObjectURL(blob));
        }, 'image/png');
    });
    return capturePromise;
};
const captureMapLegend = async (mapLegendRef: any) => {
    const mapLegendCanvas = await html2canvas(mapLegendRef.current);
    const capturePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Capture timed out'));
        }, 10000);
        mapLegendCanvas.toBlob((blob: any) => {
            clearTimeout(timeout);
            resolve(URL.createObjectURL(blob));
        }, 'image/png');
    });
    return capturePromise;
};

const captureChart = async (chartRef: any) => {
    const chartCanvas = await chartRef.current.canvas;
    const capturePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Capture timed out'));
        }, 10000);
        chartCanvas.toBlob((blob: any) => {
            clearTimeout(timeout);
            resolve(URL.createObjectURL(blob));
        }, 'image/png');
    });
    return capturePromise;
};

const captureProfilLong = async (profilLong: any) => {
    const chartCanvas = await profilLong.current.canvas;
    const capturePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Capture timed out'));
        }, 10000);
        chartCanvas.toBlob((blob: any) => {
            clearTimeout(timeout);
            resolve(URL.createObjectURL(blob));
        }, 'image/png');
    });
    return capturePromise;
};

const styles = StyleSheet.create({
    page: { padding: 20, flexDirection: "column" },
    title: { fontSize: 18, marginBottom: 10, textAlign: "center" },
    subtitle: { fontSize: 14, marginBottom: 5, fontWeight: "bold" },
    text: { fontSize: 12, marginBottom: 2 },
    section: { marginBottom: 10, borderBottom: "1 solid #ccc", paddingBottom: 5 },
    image: { width: "100%", height: "auto", marginTop: 10 },
    imageContainer: { marginTop: 40, alignItems: "center" },
    legendImage: { width: "60%", height: "auto", marginTop: 5 },
    selectionMap: { width: "100%", height: "auto", maxHeight: "100%" },
    selectionMapContainer: { flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 },
});

const ExportPdfDocument = ({
    selectionMapElements,
    selectionMapImageUrl,
    chartImageUrls,
    mapImageUrls,
    legendMapImageUrls,
    profilLongImageUrls,
}: any) => {
    return (
        <Document title={selectionMapElements.program_name} author='Geodom'>
            {/* Page 1 - Informations générales */}
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.title}>Capsule : {selectionMapElements.program_name}</Text>
                    <Text style={styles.text}>Date: {new Date().toLocaleString()}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Variables sélectionnées :</Text>
                    {selectionMapElements.selectedVariables.map((variable: any, index: any) => (
                        <Text key={index} style={styles.text}>
                            - {variable.var_code} : {variable.var_name}
                        </Text>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.subtitle}>Scénarios sélectionnés :</Text>
                    {selectionMapElements.selectedScenarios.map((scenario: any, index: any) => (
                        <Text key={index} style={styles.text}>
                            - {scenario.year} : {scenario.description}
                        </Text>
                    ))}
                </View>

                {selectionMapImageUrl && (
                    <View style={styles.selectionMapContainer}>
                        <Text style={styles.subtitle}>Carte de sélection :</Text>
                        <Image src={selectionMapImageUrl} style={styles.selectionMap} />
                    </View>
                )}
            </Page>

            {/* Page 2.1 - Evolution temporelle */}
            {chartImageUrls?.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.title}>Évolution temporelle</Text>
                    {chartImageUrls.slice(0, 2).map((url: any, index: any) => (
                        <View key={index} style={styles.imageContainer}>
                            <Text style={styles.subtitle}>Graphique {index + 1} :</Text>
                            <Image src={url} style={styles.image} />
                        </View>
                    ))}
                </Page>
            )}
            {/* Page 2.2 - Evolution temporelle */}
            {chartImageUrls?.length > 2 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.title}>Évolution temporelle</Text>
                    {chartImageUrls.slice(2, 4).map((url: any, index: any) => (
                        <View key={index} style={styles.imageContainer}>
                            <Text style={styles.subtitle}>Graphique {index + 3} :</Text>
                            <Image src={url} style={styles.image} />
                        </View>
                    ))}
                </Page>
            )}

            {/* Page 3.1 - Carte des seuils avec légendes */}
            {mapImageUrls?.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.title}>Carte des seuils</Text>
                    {mapImageUrls.slice(0, 2).map((url: any, index: any) => (
                        <View key={index} style={styles.imageContainer}>
                            <Text style={styles.subtitle}>Carte {index + 1} :</Text>
                            <Image src={url} style={styles.image} />

                            {/* Affichage de la légende associée si disponible */}
                            {legendMapImageUrls?.[index] && (
                                <Image src={legendMapImageUrls[index]} style={styles.legendImage} />
                            )}
                        </View>
                    ))}
                </Page>
            )}
            {/* Page 3.2 - Carte des seuils avec légendes */}
            {mapImageUrls?.length > 2 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.title}>Carte des seuils</Text>
                    {mapImageUrls.slice(2, 4).map((url: any, index: any) => (
                        <View key={index} style={styles.imageContainer}>
                            <Text style={styles.subtitle}>Carte {index + 3} :</Text>
                            <Image src={url} style={styles.image} />

                            {/* Affichage de la légende associée si disponible */}
                            {legendMapImageUrls?.[index + 2] && (
                                <Image src={legendMapImageUrls[index + 2]} style={styles.legendImage} />
                            )}
                        </View>
                    ))}
                </Page>
            )}

            {/* Page 4.1 - Evolution spatiale */}
            {profilLongImageUrls?.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.title}>Évolution spatiale</Text>
                    {profilLongImageUrls.slice(0, 2).map((url: any, index: any) => (
                        <View key={index} style={styles.imageContainer}>
                            <Text style={styles.subtitle}>Profil Long {index + 1} :</Text>
                            <Image src={url} style={styles.image} />
                        </View>
                    ))}
                </Page>
            )}
            {/* Page 4.2 - Evolution spatiale */}
            {profilLongImageUrls?.length > 2 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.title}>Évolution spatiale</Text>
                    {profilLongImageUrls.slice(2, 4).map((url: any, index: any) => (
                        <View key={index} style={styles.imageContainer}>
                            <Text style={styles.subtitle}>Profil Long {index + 3} :</Text>
                            <Image src={url} style={styles.image} />
                        </View>
                    ))}
                </Page>
            )}
        </Document>
    );
};


interface ExportPdfComponentProps {
    exportPdfInfo: any;
}

const ExportPdfComponent: React.FC<ExportPdfComponentProps> = ({ exportPdfInfo }) => {


    const { selectionMapElements, chartElements, mapElements, profilLongElements } = exportPdfInfo;
    const [selectionMapImageUrl, setSelectionMapImageUrl] = useState<string | null>(null);
    const [chartImageUrls, setChartImageUrls] = useState<string[]>([]);
    const [mapImageUrls, setMapImageUrls] = useState<string[]>([]);
    const [mapLegendImageUrls, setMapLegendImageUrls] = useState<string[]>([]);
    const [profilLongImageUrls, setProfilLongImageUrls] = useState<string[]>([]);

    useEffect(() => {
        const captureSelectionMapImage = async () => {
            if (selectionMapImageUrl) {
                URL.revokeObjectURL(selectionMapImageUrl);
                setSelectionMapImageUrl(null);
            }
            if (selectionMapElements.mapRef.current) {
                const mapUrl = await captureMap(selectionMapElements.mapRef);
                setSelectionMapImageUrl(mapUrl as string);
            }
        };

        captureSelectionMapImage();
    }, [selectionMapElements]);

    useEffect(() => {
        const captureChartImages = async () => {

            if (chartImageUrls.length > 0) {
                chartImageUrls.forEach((url) => {
                    URL.revokeObjectURL(url);
                });;
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
        };

        captureChartImages();
    }, [chartElements]);

    useEffect(() => {
        const captureMapImages = async () => {
            if (mapImageUrls.length > 0) {
                mapImageUrls.forEach((url) => {
                    URL.revokeObjectURL(url);
                });
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
        };

        captureMapImages();
    }, [mapElements]);

    useEffect(() => {
        const captureLegendMapImages = async () => {
            if (mapLegendImageUrls.length > 0) {
                mapLegendImageUrls.forEach((url) => {
                    URL.revokeObjectURL(url);
                });
                setMapLegendImageUrls([]);
            }
            const legendMapUrls = await Promise.all(
                mapElements.mapLegendRefs.current.map(async (legendMapRef: any) => {
                    if (legendMapRef.current) {
                        return await captureMapLegend(legendMapRef);
                    }
                    return null;
                })
            );
            setMapLegendImageUrls(legendMapUrls.filter((url) => url !== null) as string[]);
        };

        captureLegendMapImages();
    }, [mapElements]);


    useEffect(() => {
        const captureProfilLongImages = async () => {
            if (profilLongImageUrls.length > 0) {
                profilLongImageUrls.forEach((url) => {
                    URL.revokeObjectURL(url);
                });
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
        };

        captureProfilLongImages();
    }, [profilLongElements]);

    return (
        <div className="export_container">
            <PDFDownloadLink
                document={<ExportPdfDocument
                    selectionMapElements={selectionMapElements}
                    selectionMapImageUrl={selectionMapImageUrl}
                    chartImageUrls={chartImageUrls}
                    mapImageUrls={mapImageUrls}
                    legendMapImageUrls={mapLegendImageUrls}
                    profilLongImageUrls={profilLongImageUrls}
                />}
                fileName={`export_${exportPdfInfo.selectionMapElements.program_name}.pdf`}
            >
                <ButtonComponent onClick={() => { }} txt={'PDF'} disabled={false} />
            </PDFDownloadLink>

        </div>
    );
};

export default ExportPdfComponent;