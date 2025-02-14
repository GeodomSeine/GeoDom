import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import { LatLngBounds, PathOptions } from 'leaflet';
import { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { getBassin, getBassinSLD, GeoJsonResponse } from '../../services/api';
import { parseSLDToStyles } from '../../mapstyles/mapStyles';
import "leaflet/dist/leaflet.css";
import "../../styles/main.scss";

const { BaseLayer, Overlay } = LayersControl;

interface MapComponentProps {
  program: string;
  space3Data: GeoJsonResponse | null;
  variables: string[];
}

const MapComponent: React.FC<MapComponentProps> = ({
  program,
  space3Data, 
  variables, 
}) => {
  const [bassinData, setBassinData] = useState<GeoJsonResponse | null>(null);
  const [bassinStyle, setBassinStyle] = useState<PathOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string>(variables[0]);
  const [selectedPercentile, setSelectedPercentile] = useState<string>('p5');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bassinData = await getBassin(program);
        if (bassinData) {
          setBassinData(bassinData);
          setBounds(calculateBounds(bassinData));
        }
        
        const bassinSLDData = await getBassinSLD(program);
        if (bassinSLDData) {
          const bassinSLDText = await bassinSLDData.text();
          const styles = parseSLDToStyles(bassinSLDText);
          setBassinStyle({
            color: styles[0]?.color || "#333333",
            weight: styles[0]?.weight || 3,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [program, space3Data]);

  const calculateBounds = (bassin: GeoJsonResponse): LatLngBounds => {
    const coordinates = bassin.features[0]?.geometry?.coordinates[0];
    if (!coordinates) return new LatLngBounds([0, 0], [0, 0]);
    
    let minLat = 90,
    maxLat = -90,
    minLng = 180,
    maxLng = -180;
    
    coordinates.forEach(([lng, lat]: number[]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });
    
    return new LatLngBounds([minLat, minLng], [maxLat, maxLng]);
  };
  
  const getHydroStyle = (feature: any): PathOptions => {
    console.log("Je vais chercher le style de merde");
    console.log("Voici ma feature : ", feature.properties.data);
    const variableData = feature.properties?.data?.find((v: any) => v.variable === selectedVariable);
    console.log("variable Data : ", variableData);
    if (variableData) {
        const color = variableData?.[`color_${selectedPercentile}`];
        console.log("color : ", color)
        return {
            color: color || "#000000", // Défaut noir si aucune couleur trouvée
            weight: 3,
        };
    }
    console.log("Variable non trouvée mec, casse toi");
    return {
        color: "#000000",
        weight: 1,
    };
  };

  return (
    <div className="map_component">
      <div className="controls">
        <label>Variable :</label>
        {variables.map((variable) => (
          <label key={variable}>
            <input
              type="radio"
              name="variable"
              value={variable}
              checked={selectedVariable === variable}
              onChange={() => setSelectedVariable(variable)}
            />
            {variable.toUpperCase()}
          </label>
        ))}

        <label>Percentile :</label>
        {["p5", "p50", "p90"].map((percentile) => (
          <label key={percentile}>
            <input
              type="radio"
              name="percentile"
              value={percentile}
              checked={selectedPercentile === percentile}
              onChange={() => setSelectedPercentile(percentile)}
            />
            {percentile.toUpperCase()}
          </label>
        ))}
      </div>

      {!loading && bounds && (
        <MapContainer
          attributionControl={false}
          bounds={bounds}
          zoom={7}
          minZoom={7}
          zoomControl={false}
        >
        <LayersControl>
          <BaseLayer checked name="Esri Topographic">
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
          </BaseLayer>
          
          {space3Data && (
            <Overlay checked name="Hydrographie">
              <GeoJSON
                key="hydro"
                data={space3Data as GeoJsonObject}
                style={getHydroStyle}
                interactive={true}
              />
            </Overlay>
          )}

          {bassinData && bassinStyle && (
            <Overlay checked name="Bassin">
              <GeoJSON
                data={bassinData as GeoJsonObject}
                style={() => bassinStyle}
                interactive={false}
              />
            </Overlay>
          )}
        </LayersControl>
        </MapContainer>
      )}
    </div>
  );
};
export default MapComponent;
