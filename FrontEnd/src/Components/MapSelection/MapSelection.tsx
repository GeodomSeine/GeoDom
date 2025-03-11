import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMapEvents, useMap } from 'react-leaflet';
import { CircleMarker, LatLngBounds, PathOptions } from 'leaflet';
import { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { streamHydroData, getStationSnap, getStationSnapSld, getHydroSLD, GeoJsonResponse, AmontAvalResponse, Scenario, ProgramVariable } from '../../services/api';
import { parseSLDToStyles } from '../../mapstyles/mapStyles';
import "./MapSelection.scss";
import "../../styles/main.scss";
import { createRoot } from 'react-dom/client';
import PopupContent from './PopupContent';
import MapButtons from '../SimpleComponents/MapButtons';
import ControlComponent from './ControlComponent';
import { getColor } from '../../utils/mapUtils';
// @ts-ignore
import simplify from "simplify-geojson";

const { BaseLayer, Overlay } = LayersControl;


interface MapSelectionProps {
  // map ref used by the pdf export
  mapRef: any;
  // program name
  bassinData: GeoJsonResponse | null;
  bassinStyle: PathOptions | null;
  bounds: LatLngBounds | null;
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
  bassinData,
  bassinStyle,
  bounds,
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
  const [hydroStyles, setHydroStyles] = useState<any[]>([]);
  const [stationSnap, setStationSnap] = useState<GeoJsonResponse | null>(null);
  const [stationSnapStyles, setStationSnapStyles] = useState<PathOptions | null>(null);
  const idHydStartRef = useRef<number | null>(idHydStart);
  const idHydEndRef = useRef<number | null>(idHydEnd);

  const [currentZoom, setCurrentZoom] = useState(6);
  const [simplifiedHydroData, setSimplifiedHydroData] = useState<GeoJsonResponse | null>(hydroData);
  const selectedPkRef = useRef<any>(selectedPk);
  const pkByStrahlerRef = useRef<any>(pkByStrahler);

  useEffect(() => {
    idHydStartRef.current = idHydStart;
    idHydEndRef.current = idHydEnd;
  }, [idHydStart, idHydEnd]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lancer les appels API en parallèle
        const hydroSLDPromise = getHydroSLD(program);
        const stationSLDPromise = getStationSnapSld(program);
        const stationPromise = getStationSnap(program);

        const stationData = await stationPromise

        if (stationData) {
          setStationSnap(stationData);
        }

        // Fonction pour parser un SLD en évitant le blocage
        const parseSLD = async (sldPromise: Promise<Blob | null>, callback: (styles: any) => void) => {
          try {
            const blob = await sldPromise;
            if (!blob) return;

            const text = await blob.text(); // Convertir Blob en texte
            requestIdleCallback(() => {
              const styles = parseSLDToStyles(text);
              callback(styles);
            });
          } catch (error) {
            console.error("Erreur lors du parsing SLD :", error);
          }
        };

        // Lancer le parsing SLD de manière optimisée
        parseSLD(hydroSLDPromise, setHydroStyles);
        parseSLD(stationSLDPromise, (styles) => {
          setStationSnapStyles({ color: styles[0]?.color || getColor("--success-color"), weight: styles[0]?.weight || 3 });
        });

        // Démarrer le streaming des données hydrographiques sans attendre les autres
        streamHydroData(program, setHydroData);

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

  //  define the layer, and if they are visible
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    baseLayer: true,
    hydrographie: true,
    bassin: true,
    stations: false,
    pk: true,
  });

  // set the style of the pk, or worm
  const getHydroStyle = (feature: any): PathOptions => {
    const strahler = feature.properties?.strahler;
    const id = feature.properties?.id_hyd;

    if (amontAvalResponse?.id_hyd.includes(id))
      return { color: getColor("--danger-color"), weight: 3 };
    if (idHydStart === id || idHydEnd === id)
      return { color: getColor("--success-color"), weight: 4 };
    for (const rule of hydroStyles) {
      if (strahler >= rule.min && strahler <= rule.max)
        return { color: rule.color, weight: rule.weight };
    }
    return { color: getColor("--basic-black"), weight: 1 };
  };

  // handle click on a pk, to create a selection pop-up on the map
  const handleFeatureClick = (feature: { properties: { [key: string]: any } }, layer: any, popUpLayer: "Hydro" | "Station") => {
    const properties = feature.properties;

    // create an element when to render the elements in the pop-up
    const popupContent = document.createElement("div");
    popupContent.setAttribute("class", "leaflet-elements-container");

    // handle the click of the selected amont
    const onSelectAmont = () => {
      setIdHydStart(properties.id_hyd);
      setIdHydEnd(exutoire_id);
      layer.closePopup();
    };
    // handle the click of the selected aval
    const onSelectAval = () => {
      setIdHydEnd(properties.id_hyd);
      layer.closePopup();
    };

    const root = createRoot(popupContent);
    // here unfotunatly, leaflet only accept pre-render html element, 
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

  // Fonction pour récupérer la tolérance en fonction du zoom
  const getSimplifyTolerance = (zoom: number) => {
    if (zoom >= 8) return 0.005;   // Moins détaillé
    return 0.03;                   // Très simplifié
  };

  const adaptDataToZoom = (zoom: number) => {
    if (hydroData) {
      if (zoom >= 10) {
        setSimplifiedHydroData(hydroData);
      } else {
        const tolerance = getSimplifyTolerance(zoom);
        const simplified = simplify(hydroData, tolerance);
        setSimplifiedHydroData(simplified);
      }
    }
  }

  // Gestion du zoom et simplification dynamique
  const ZoomHandler = () => {
    useMapEvents({
      zoomend: (event) => {
        const newZoom = event.target.getZoom();
        adaptDataToZoom(newZoom);
        setCurrentZoom(newZoom);
        if (selectedPkRef.current) {
          selectedPkRef.current.bringToFront();
        }
        if (pkByStrahlerRef.current) {
          pkByStrahlerRef.current.bringToFront();
        }
      },
      click: () => {
        resetSelection();
      }
    });
    return null;
  };

  useEffect(() => {
    adaptDataToZoom(currentZoom);
  }, [hydroData]);

  useEffect(() => {
    if (selectedPkRef.current) {
      selectedPkRef.current.bringToFront();
    }
  }, [selectedPk]);

  useEffect(() => {
    if (pkByStrahlerRef.current) {
      pkByStrahlerRef.current.bringToFront();
    }
  }, [pkByStrahler]);

  const CreateCustomPanes = () => {
    const map = useMap();

    useEffect(() => {
      if (map) {
        // Création du pane pour PK
        map.createPane("pkPane");
        map.getPane("pkPane")!.style.zIndex = "600"; // Définit l'ordre d'affichage
      }
    }, [map]);

    return null;
  };

  return (
    <div className="map_component">
      <MapContainer
        ref={mapRef}
        preferCanvas={true} // Active le rendu Canvas
        attributionControl={false}
        bounds={bounds || [[50.9, -1.5], [46.5, 8.5]]}
        zoom={6}
        minZoom={6}
        zoomControl={false}
      >
        {/* Création des panes */}
        <CreateCustomPanes />

        <ZoomHandler /> {/* Gère les changements de zoom */}
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
              updateWhenIdle={false} // Charge les tuiles seulement quand nécessaire
              updateWhenZooming={false} // Ne recharge pas en zoomant
              keepBuffer={5} // Garde 5 niveaux de tuiles en cache
            />
          </BaseLayer>
          {bassinData && bassinStyle && (
            <Overlay {...(layerVisibility.bassin ? { checked: true } : { checked: false })} name="Bassin">
              <GeoJSON
                data={bassinData as GeoJsonObject}
                style={() => bassinStyle}
                interactive={false}
              />
            </Overlay>
          )}

          {simplifiedHydroData && hydroStyles && (
            <Overlay checked={layerVisibility.hydrographie} name="Hydrographie">
              <GeoJSON
                key={`hydro-${currentZoom}-${simplifiedHydroData.features.length}-${mode}`}
                data={simplifiedHydroData as GeoJsonObject}
                style={getHydroStyle}
                interactive={true}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    click: () => handleFeatureClick(feature, layer, "Hydro"),
                  });
                }}
              />
            </Overlay>
          )}

          {selectedPk && (
            <Overlay {...(layerVisibility.pk ? { checked: true } : { checked: false })} name="PK">
              <GeoJSON
                ref={selectedPkRef}
                key={JSON.stringify(selectedPk)}
                data={selectedPk as GeoJsonObject}
                style={{ color: getColor("--success-color"), weight: 6 }}
                interactive={false}
                pane="pkPane"
              />
            </Overlay>
          )}
          {pkByStrahler && (
            <Overlay {...(layerVisibility.pk ? { checked: true } : { checked: false })} name="Pk par strahler">
              <GeoJSON
                key={JSON.stringify(pkByStrahler)}
                ref={pkByStrahlerRef}
                data={pkByStrahler as GeoJsonObject}
                style={{ color: getColor("--success-color"), weight: 2 }}
                interactive={false}
                pane="pkPane"
              />
            </Overlay>
          )}

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

        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default MapSelection;
