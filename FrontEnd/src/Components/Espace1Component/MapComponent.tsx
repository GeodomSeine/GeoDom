  import React, { useEffect, useRef, useState } from 'react';
  import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
  import { CircleMarker, LatLngBounds, PathOptions } from 'leaflet';
  import { GeoJsonObject } from 'geojson';
  import 'leaflet/dist/leaflet.css';
  import { getHydro, getBassin, getStationSnap, getStationSnapSld, getHydroSLD, getBassinSLD, GeoJsonResponse, AmontAvalResponse } from '../../services/api';
  import { parseSLDToStyles } from '../../mapstyles/mapStyles';
  import "leaflet/dist/leaflet.css";
  import "./MapComponent.scss";
  import "../../styles/main.scss";
  import Add from "../../assets/add.svg?react";
  import Minus from "../../assets/minus.svg?react";
  import Expand from "../../assets/expand.svg?react";
  import LogoComponent from "../LogoComponent";
  import LoadingProgress from '../LoadingProgress/LoadingProgress';
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
    mode : "complet" | "amont-aval";
  }
  
  const CustomControls: React.FC<{ bounds: LatLngBounds | null }> = ({
    bounds,
  }) => {
    const map = useMap();
    const zoomToBounds = () => {
      bounds && map.fitBounds(bounds);
    };
    
    return (
      <div className="custom_buttons">
      {bounds && (
        <LogoComponent Icon={Expand} size={"35px"} onClick={zoomToBounds} program={''} selectedVariables={[]} selectedScenarios={[]} idHydStart={null} idHydEnd={null} download={false} selectedPk={undefined} selectedStralher={null} />
      )}
      <LogoComponent
          Icon={Add}
          size={"35px"}
          onClick={() => map.setZoom(map.getZoom() + 1)} program={''} selectedVariables={[]} selectedScenarios={[]} idHydStart={null} idHydEnd={null} download={false} selectedPk={undefined} selectedStralher={null}      ></LogoComponent>
      <LogoComponent
          Icon={Minus}
          size={"35px"}
          onClick={() => map.setZoom(map.getZoom() - 1)} program={''} selectedVariables={[]} selectedScenarios={[]} idHydStart={null} idHydEnd={null} download={false} selectedPk={undefined} selectedStralher={null}      ></LogoComponent>
    </div>
  );
};

interface MapComponentProps {
  program: string;
  exutoire_id: number;
  idHydStart: number | null;
  idHydEnd: number | null;
  amontAvalResponse: AmontAvalResponse | null;
  setIdHydStart: (id: number | null) => void;
  setIdHydEnd: (id: number | null) => void;
  selectedPk?: GeoJsonResponse;
  mode : "complet" | "amont-aval";
}

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
  console.log("exutoire_id: ", exutoire_id);
  const [hydroData, setHydroData] = useState<GeoJsonResponse | null>(null);
  const [bassinData, setBassinData] = useState<GeoJsonResponse | null>(null);
  const [hydroStyles, setHydroStyles] = useState<any[]>([]);
  const [bassinStyle, setBassinStyle] = useState<PathOptions | null>(null);
  const [stationSnap, setStationSnap] = useState<GeoJsonResponse | null>(null);
  const [stationSnapStyles, setStationSnapStyles] = useState<PathOptions | null>(null);
  const lastIndex = 6;
  const [currentIndex, setCurrentIndex] = useState(0);
  const idHydStartRef = useRef<number | null>(idHydStart);
  const idHydEndRef = useRef<number | null>(idHydEnd);
  const [loading, setLoading] = useState(true);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  
  useEffect(() => {
    idHydStartRef.current = idHydStart;
    idHydEndRef.current = idHydEnd;
  }, [idHydStart, idHydEnd]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let index = 0;
      setCurrentIndex(index);
      try {
        const hydroSLDData = await getHydroSLD(program);
        if (hydroSLDData) {
          const hydroSLDText = await hydroSLDData.text();
          setHydroStyles(parseSLDToStyles(hydroSLDText));
          index++;
          setCurrentIndex(index);
        }
        
        const bassinData = await getBassin(program);
        if (bassinData) {
          setBassinData(bassinData);
          setBounds(calculateBounds(bassinData));
          index++;
          setCurrentIndex(index);
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
        index++;
        setCurrentIndex(index);
        
        const stationSLDData = await getStationSnapSld(program);
        if (stationSLDData) {
          const stationSLDText = await stationSLDData.text();
          const styles = parseSLDToStyles(stationSLDText);
          setStationSnapStyles({
            color: styles[0]?.color || "green",
            weight: styles[0]?.weight || 3,
          });
        }
        index++;
        setCurrentIndex(index);
        
        index++;
        setCurrentIndex(index);
        const hydroData = await getHydro(program);
        setHydroData(hydroData);
        
        const stationData = await getStationSnap(program);
        if (stationData) {
          setStationSnap(stationData);
        }
        
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      } finally {
        setLoading(false);
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
      return { color: "orange", weight: 3 };
    if (idHydStart === id || idHydEnd === id)
      return { color: "blue", weight: 4 };
    
    for (const rule of hydroStyles) {
      if (strahler >= rule.min && strahler <= rule.max)
        return { color: rule.color, weight: rule.weight };
    }
    
    return { color: "#000000", weight: 1 };
  };
  
  const handleFeatureClick = (feature: { properties: { [key: string]: any } }, layer: any) => {
    const properties = feature.properties;
  
    const popupContent = document.createElement("div");
    popupContent.setAttribute("class", "leaflet-elements-container")
  
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
    {loading && (
      <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '40%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }}
      >
      <LoadingProgress currentIndex={currentIndex} lastIndex={lastIndex} />
      </div>
    )}
    
    {!loading && bounds && (
      <MapContainer
        attributionControl={false}
        bounds={bounds}
        zoom={7}
        minZoom={7}
        zoomControl={false}
      >
      <CustomControls bounds={bounds} />
      <LayersControl>
        <BaseLayer checked name="Esri Topographic">
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}" />
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
            key={`hydro-${mode}`}
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
          <GeoJSON key={JSON.stringify(selectedPk)} data={selectedPk as GeoJsonObject} style={{ color: 'green', weight: 10 }} interactive={false} />
        </Overlay>
      )}
      </LayersControl>
      </MapContainer>
    )}
    </div>
  );
};
export default MapComponent;