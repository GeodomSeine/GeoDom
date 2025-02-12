import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import { CircleMarker, LatLngBounds, PathOptions } from 'leaflet';
import { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import {streamHydroData, getBassin, getStationSnap, getStationSnapSld, getHydroSLD, getBassinSLD, GeoJsonResponse, AmontAvalResponse } from '../../services/api';
import { parseSLDToStyles } from '../../mapstyles/mapStyles';
import "leaflet/dist/leaflet.css";
import "./MapComponent.scss";
import "../../styles/main.scss";
import Add from "../../assets/add.svg?react";
import Minus from "../../assets/minus.svg?react";
import Expand from "../../assets/expand.svg?react";
import LogoComponent from "../LogoComponent";
import { createRoot } from 'react-dom/client';
import PopupContent from './PopupContent';

const { BaseLayer, Overlay } = LayersControl;

interface MapComponentProps {
  program: string;
  exutoire_id: number;
  idHydStart: number | null;
  idHydEnd: number | null;
  amontAvalResponse: AmontAvalResponse | null;
  setIdHydStart: (id: number | null) => void;
  setIdHydEnd: (id: number | null) => void;
  selectedPk?: GeoJsonResponse;
  mode: "complet" | "amont-aval";
}

const CustomControls: React.FC<{ bounds: LatLngBounds | null }> = ({ bounds }) => {
  const map = useMap();
  const zoomToBounds = () => {
    bounds && map.fitBounds(bounds);
  };

  return (
    <div className="custom_buttons">
      {bounds && (
        <LogoComponent Icon={Expand} size={"35px"} onClick={zoomToBounds} />
      )}
      <LogoComponent
        Icon={Add}
        size={"35px"}
        onClick={() => map.setZoom(map.getZoom() + 1)} />
      <LogoComponent
        Icon={Minus}
        size={"35px"}
        onClick={() => map.setZoom(map.getZoom() - 1)} />
    </div>
  );
};

const MapComponent: React.FC<MapComponentProps> = ({
  program,
  exutoire_id,
  idHydStart,
  idHydEnd,
  amontAvalResponse,
  setIdHydStart,
  setIdHydEnd,
  selectedPk,
  mode
}) => {
  const [hydroData, setHydroData] = useState<GeoJsonResponse | null>(null);
  const [bassinData, setBassinData] = useState<GeoJsonResponse | null>(null);
  const [hydroStyles, setHydroStyles] = useState<any[]>([]);
  const [bassinStyle, setBassinStyle] = useState<PathOptions | null>(null);
  const [stationSnap, setStationSnap] = useState<GeoJsonResponse | null>(null);
  const [stationSnapStyles, setStationSnapStyles] = useState<PathOptions | null>(null);
  const idHydStartRef = useRef<number | null>(idHydStart);
  const idHydEndRef = useRef<number | null>(idHydEnd);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);

  useEffect(() => {
    idHydStartRef.current = idHydStart;
    idHydEndRef.current = idHydEnd;
  }, [idHydStart, idHydEnd]);



  useEffect(() => {
    const fetchData = async () => {
        try {

            // Chargement des autres couches (bassin, stations, etc.)
            const [
                hydroSLDData,
                bassinData,
                bassinSLDData,
                stationSLDData,
                stationData
            ] = await Promise.all([
                getHydroSLD(program),
                getBassin(program),
                getBassinSLD(program),
                getStationSnapSld(program),
                getStationSnap(program)
            ]);

            if (hydroSLDData) {
                const hydroSLDText = await hydroSLDData.text();
                setHydroStyles(parseSLDToStyles(hydroSLDText));
            }

            if (bassinData) {
                setBassinData(bassinData);
                setBounds(calculateBounds(bassinData));
            }

            if (bassinSLDData) {
                const bassinSLDText = await bassinSLDData.text();
                const styles = parseSLDToStyles(bassinSLDText);
                setBassinStyle({ color: styles[0]?.color || "var(--basic-black)", weight: styles[0]?.weight || 3 });
            }
            
            await streamHydroData(program, setHydroData);

            if (stationSLDData) {
                const stationSLDText = await stationSLDData.text();
                const styles = parseSLDToStyles(stationSLDText);
                setStationSnapStyles({ color: styles[0]?.color || "var(--success-color)", weight: styles[0]?.weight || 3 });
            }

            if (stationData) {
                setStationSnap(stationData);
            }

        } catch (error) {
            console.error("Erreur lors du chargement des données :", error);
        }
    };

    fetchData();
  }, [program]);


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
const strahler = feature.properties?.strahler;
const id = feature.properties?.id_hyd;

if (amontAvalResponse?.id_hyd.includes(id))
  return { color: "var(--warning-color)", weight: 3 };
if (idHydStart === id || idHydEnd === id)
  return { color: "var(--success-color)", weight: 4 };

for (const rule of hydroStyles) {
  if (strahler >= rule.min && strahler <= rule.max)
    return { color: rule.color, weight: rule.weight };
}

return { color: "var(--basic-black)", weight: 1 };
};

const handleFeatureClick = (feature: { properties: { [key: string]: any } }, layer: any) => {
const properties = feature.properties;

const popupContent = document.createElement("div");
popupContent.setAttribute("class", "leaflet-elements-container");

const onSelectAmont = () => {
  setIdHydStart(properties.id_hyd);
  setIdHydEnd(exutoire_id);
  layer.closePopup();
};

const onSelectAval = () => {
  setIdHydEnd(properties.id_hyd);
  layer.closePopup();
};

const root = createRoot(popupContent);
root.render(
  <PopupContent
    properties={properties}
    mode={mode}
    onSelectAmont={onSelectAmont}
    onSelectAval={onSelectAval}
  />
);

layer.bindPopup(popupContent).openPopup();
};

return (
<div className="map_component">
  <MapContainer
      attributionControl={false}
      bounds={bounds || [[50.9, -1.5], [46.5, 8.5]]}
      zoom={6} 
      minZoom={6}
      zoomControl={false}
  >
    <CustomControls bounds={bounds} />
    <LayersControl>
      <BaseLayer checked name="BaseLayer">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
      </BaseLayer>

      {stationSnap && stationSnapStyles && (
        <Overlay name="Stations d'observation">
          <GeoJSON
            data={stationSnap as GeoJsonObject}
            pointToLayer={(_, latlng) => {
              const style = {
                ...stationSnapStyles,
                radius: 5,
              };
              return new CircleMarker(latlng, style);
            }}
          />
        </Overlay>
      )}

      {hydroData && hydroStyles && (
          <Overlay checked name="Hydrographie">
              <GeoJSON
                  key={`hydro-${mode}-${hydroData.features.length}`} // 🟢 Forçage de mise à jour
                  data={hydroData as GeoJsonObject}
                  style={getHydroStyle}
                  interactive={true}
                  onEachFeature={(feature, layer) => {
                      layer.off();
                      layer.on({
                          click: () => handleFeatureClick(feature, layer),
                      });
                  }}
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

      {selectedPk && (
        <Overlay checked name="PK">
          <GeoJSON
            key={JSON.stringify(selectedPk)}
            data={selectedPk as GeoJsonObject}
            style={{ color: "var(--success-color)", weight: 6 }}
            interactive={false}
          />
        </Overlay>
      )}
    </LayersControl>
  </MapContainer>
</div>
);
};

export default MapComponent;
