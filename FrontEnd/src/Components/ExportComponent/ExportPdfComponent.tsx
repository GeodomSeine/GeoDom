import React, { useEffect, useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import "leaflet-simple-map-screenshoter";
import ButtonComponent from '../SimpleComponents/ButtonComponent';

const captureMap = async (mapRef: any) => {
    const plugin = mapRef.current.plugin;
    const capturePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Capture timed out'));
        }, 10000);
        plugin.takeScreen("blob", { mimeType: "image/png" })
            .then((blob: any) => {
                clearTimeout(timeout);
                resolve(URL.createObjectURL(blob));
            })
            .catch((error: any) => {
                clearTimeout(timeout);
                reject(error);
            });
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
    page: { padding: 20, flexDirection: 'column' },
    title: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 14, marginBottom: 5, fontWeight: 'bold' },
    text: { fontSize: 12, marginBottom: 2 },
    section: { marginBottom: 10, borderBottom: '1 solid #ccc', paddingBottom: 5 },
    image: { width: '100%', height: 'auto', marginTop: 10 },
    imageContainer: { marginTop: 20, alignItems: 'center' },
});

const ExportPdfDocument = ({ selectionMapElements, selectionMapImageUrl, chartImageUrls, mapImageUrls, profilLongImageUrls }: any) => {

    return (
        <Document>
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
                    <View style={styles.imageContainer}>
                        <Text style={styles.subtitle}>Carte de sélection :</Text>
                        <Image src={selectionMapImageUrl} style={styles.image} />
                    </View>
                )}
            </Page>

            {/* Page 2 - Evolution temporelle */}
            {chartImageUrls?.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.title}>Évolution temporelle</Text>
                    {chartImageUrls.map((url: any, index: any) => (
                        <View key={index} style={styles.imageContainer}>
                            <Text style={styles.subtitle}>Graphique {index + 1} :</Text>
                            <Image src={url} style={styles.image} />
                        </View>
                    ))}
                </Page>
            )}

            {/* Page 3 - Carte des seuils */}
            {mapImageUrls?.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.title}>Carte des seuils</Text>
                    {mapImageUrls.map((url: any, index: any) => (
                        <View key={index} style={styles.imageContainer}>
                            <Text style={styles.subtitle}>Carte {index + 1} :</Text>
                            <Image src={url} style={styles.image} />
                        </View>
                    ))}
                </Page>
            )}

            {/* Page 4 - Evolution spatiale */}
            {profilLongImageUrls?.length > 0 && (
                <Page size="A4" style={styles.page}>
                    <Text style={styles.title}>Évolution spatiale</Text>
                    {profilLongImageUrls.map((url: any, index: any) => (
                        <View key={index} style={styles.imageContainer}>
                            <Text style={styles.subtitle}>Profil Long {index + 1} :</Text>
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
                    <ButtonComponent onClick={() => { }} txt={'PDF'} />
                </PDFDownloadLink>
            ) : (
                <ButtonComponent onClick={() => { }} txt={'Préparation du PDF...'} disabled={true} />
            )}
        </div>
    );
};

export default ExportPdfComponent;