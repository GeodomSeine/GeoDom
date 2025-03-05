import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import { CircleMarker, LatLngBounds, PathOptions } from 'leaflet';
import { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import {streamHydroData, getBassin, getStationSnap, getStationSnapSld, getHydroSLD, getBassinSLD, GeoJsonResponse, AmontAvalResponse, Scenario, ProgramVariable } from '../../services/api';
import { parseSLDToStyles } from '../../mapstyles/mapStyles';
import "leaflet/dist/leaflet.css";
import "./MapSelection.scss";
import "../../styles/main.scss";
import { createRoot } from 'react-dom/client';
import PopupContent from './PopupContent';
import MapButtons from '../SimpleComponents/MapButtons';
import ControlComponent from './ControlComponent';
import { calculateBounds } from '../../utils/mapUtils';

const { BaseLayer, Overlay } = LayersControl;


interface MapSelectionProps {
  mapRef: any;
  program: string;
  exutoire_id: number;
  idHydStart: number | null;
  idHydEnd: number | null;
  amontAvalResponse: AmontAvalResponse | null;
  setIdHydStart: (id: number | null) => void;
  setIdHydEnd: (id: number | null) => void;
  selectedPk?: GeoJsonResponse;
  pkByStrahler?: GeoJsonResponse;
  resetSelection: () => void;
  variables: ProgramVariable[];
  scenarios: Scenario[];
  selectedVariables: ProgramVariable[];
  setSelectedVariables: (variables: ProgramVariable[]) => void;
  selectedScenarios: Scenario[];
  setSelectedScenarios: (scenarios: Scenario[]) => void;
  mode: "complet" | "amont-aval";
  setMode: (mode: "complet" | "amont-aval") => void;
  scenarioColors: Record<number, string>;
}

const MapSelection: React.FC<MapSelectionProps> = ({
  mapRef,
  program,
  exutoire_id,
  idHydStart,
  idHydEnd,
  amontAvalResponse,
  setIdHydStart,
  setIdHydEnd,
  scenarios,
  selectedPk,
  pkByStrahler,
  resetSelection,
  variables,
  selectedVariables,
  setSelectedVariables,
  selectedScenarios,
  setSelectedScenarios,
  mode,
  setMode,
  scenarioColors
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

  //force leaflet to update its size if the containers change width
  useEffect(() => {
    if (!mapRef.current) return;
    const mapContainer = mapRef.current.getContainer().parentElement;
    if (!mapContainer) return;
    let lastWidth = mapContainer.offsetWidth;
  
    //observe the width change of the container
    const observer = new ResizeObserver(() => {
      if (!mapRef.current || !mapContainer) return;
      const newWidth = mapContainer.offsetWidth;
  
      if (newWidth !== lastWidth) { 
        lastWidth = newWidth;
        // timeout to avoid multiple invalidation
        setTimeout(() => {
          mapRef.current.invalidateSize(); 
          mapRef.current.setView(mapRef.current.getCenter(), mapRef.current.getZoom()); 
        }, 300);
      }
    });
  
    observer.observe(mapContainer);
    return () => observer.disconnect();
  }, [mapRef.current]); 
  

const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
  baseLayer: true,
  hydrographie: true,
  bassin: true, 
  stations: false,
  pk: true,
});

const getHydroStyle = (feature: any): PathOptions => {
  const strahler = feature.properties?.strahler;
  const id = feature.properties?.id_hyd;

  if (amontAvalResponse?.id_hyd.includes(id))
    return { color: "var(--danger-color)", weight: 3 };
  if (idHydStart === id || idHydEnd === id)
    return { color: "var(--success-color)", weight: 4 };

  for (const rule of hydroStyles) {
    if (strahler >= rule.min && strahler <= rule.max)
      return { color: rule.color, weight: rule.weight };
  }

  return { color: "var(--basic-black)", weight: 1 };
};

// handle click on a pk, to create a selection pop-up
const handleFeatureClick = (feature: { properties: { [key: string]: any } }, layer: any, popUpLayer: "Hydro" | "Station") => {
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
  // here unfotunatly for the moment, leaflet only accept pre-render html element, 
  // so we need to prerender element in order for them to appear in the pop-up, removing the advantages of React
  root.render(
    <PopupContent
      properties={properties}
      mode={mode}
      onSelectAmont={onSelectAmont}
      onSelectAval={onSelectAval}
      layer={popUpLayer}
    />
  );

  layer.bindPopup(popupContent).openPopup();
};

return (
<div className="map_component">
  
  <MapContainer
      ref={mapRef}
      attributionControl={false}
      bounds={bounds || [[50.9, -1.5], [46.5, 8.5]]}
      zoom={6} 
      minZoom={6} 
      zoomControl={false}
  >
    {/* className pour cacher les controles pour l'export  */}
    <div className="leaflet-control-container"> 
    <MapButtons bounds={bounds}>
        <ControlComponent
          scenarioColors={scenarioColors}
          resetSelection={resetSelection}
          variables={variables}
          selectedVariables={selectedVariables}
          setSelectedVariables={setSelectedVariables}
          selectedScenarios={selectedScenarios}
          setSelectedScenarios={setSelectedScenarios}
          scenarios={scenarios}
          mode={mode}
          setMode={setMode}
          layerVisibility={layerVisibility}
          setLayerVisibility={setLayerVisibility}
        />
    </MapButtons>
    </div>
    <LayersControl>
      <BaseLayer {...(layerVisibility.baseLayer ? { checked: true } : { checked: false })} name="BaseLayer">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
      </BaseLayer>

      {stationSnap && stationSnapStyles && (  
        <Overlay {...(layerVisibility.stations ? { checked: true } : { checked: false })} name="Stations d'observation">
          <GeoJSON
            data={stationSnap as GeoJsonObject}
            pointToLayer={(_, latlng) => {
              const style = {
                ...stationSnapStyles,
                radius: 5,
              };
              return new CircleMarker(latlng, style);
            }}
            onEachFeature={(feature, layer) => {
              layer.off();
              layer.on({
                  click: () => handleFeatureClick(feature, layer, "Station"),
              });
            }}
          />
        </Overlay>
      )}

      {hydroData && hydroStyles && (
          <Overlay {...(layerVisibility.hydrographie ? { checked: true } : { checked: false })} name="Hydrographie">
              <GeoJSON
                  key={`hydro-${mode}-${hydroData.features.length}`} // 🟢 Forçage de mise à jour
                  data={hydroData as GeoJsonObject}
                  style={getHydroStyle}
                  interactive={true}
                  onEachFeature={(feature, layer) => {
                      layer.off();
                      layer.on({
                          click: () => handleFeatureClick(feature, layer, "Hydro"),
                      });
                  }}
              />
          </Overlay>
      )}

      {bassinData && bassinStyle && (
        <Overlay {...(layerVisibility.bassin ? { checked: true } : { checked: false })} name="Bassin">
          <GeoJSON
            data={bassinData as GeoJsonObject}
            style={() => bassinStyle}
            interactive={false}
          />
        </Overlay>
      )}

      {selectedPk && (
        <Overlay {...(layerVisibility.pk ? { checked: true } : { checked: false })} name="PK">
          <GeoJSON
            key={JSON.stringify(selectedPk)}
            data={selectedPk as GeoJsonObject}
            style={{ color: "var(--success-color)", weight: 6 }}
            interactive={false}
          />
        </Overlay>
      )}
      {pkByStrahler && (
        <Overlay {...(layerVisibility.pk ? { checked: true } : { checked: false })} name="Pk par strahler">
          <GeoJSON
            key={JSON.stringify(pkByStrahler)}
            data={pkByStrahler as GeoJsonObject}
            style={{ color: "var(--success-color)", weight: 2 }}
            interactive={false}
          />
        </Overlay>
      )}
    </LayersControl>
  </MapContainer>
</div>
);
};

export default MapSelection;
