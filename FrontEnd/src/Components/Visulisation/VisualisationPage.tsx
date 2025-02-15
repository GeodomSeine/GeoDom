import React, { useState, useEffect, useMemo } from "react";
import { useProgram } from "../../contexts/ProgramContext";
import './VisualisationPage.scss';
import { getScenarios, getAmontAval, Scenario, AmontAvalResponse, DataRequest, DataResponse, getData, getFullData, DataRequestFull, GeoJsonResponse, getPkGeom, ColoredMapResponseData, ColorMapRequest, getColoredMapData, getBassin, getBassinSLD, getPkSld, streamPkData } from "../../services/api";
import { useNavigate } from "react-router";
import ToggleContainer from "./ToggleComponent";
import VariableChart from "../SimpleComponents/VariableChart";
import MapSelection from "../MapSelection/MapSelection";
import ColoredMapComponent from "../ColoredMapComponent/ColoredMapComponent";
import DecadeRangeComponent from "../SimpleComponents/DecadeRangeComponent";
import { LatLngBounds, PathOptions } from "leaflet";
import { calculateBounds } from "../../utils/mapUtils";
import { parseSLDToStyles } from "../../mapstyles/mapStyles";

type ChartData = Array<{
  decade: number;
  [variable: string]: number;
}>;

const VisualisationPage: React.FC = () => {
  const { program } = useProgram();
  const navigate = useNavigate();
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([]);
  const [amontAvalResponse, setAmontAvalResponse] = useState<AmontAvalResponse | null>(null);
  const [selectedDecades, setSelectedDecades] = useState<number[]>([1, 2, 3]);
  const [data, setData] = useState<DataResponse | null>(null);
  const [coloredMapData, setColoredMapData] = useState<ColoredMapResponseData | null>(null);
  
  const [selectedKey, setSelectedKey] = useState<string | null>(null); 
  
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedPk, setSelectedPk] = useState<GeoJsonResponse | undefined>(undefined);
  const [idHydStart, setIdHydStart] = useState<number | null>(null);
  const [idHydEnd, setIdHydEnd] = useState<number | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  
  // Génération dynamique de la requête `request`
  const [mode, setMode] = useState<"complet" | "amont-aval">("complet");
  
  
  const [pkData, setPkData] = useState<GeoJsonResponse | null>(null);
  const [pkStyles, setPkStyles] = useState<any[]>([]);
  const [bassinData, setBassinData] = useState<GeoJsonResponse | null>(null);
  const [bassinStyle, setBassinStyle] = useState<PathOptions | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if(!program){
        return;
      }

      try {
        const [
          bassinData,
          bassinSLDData,
          pkSLDData,
        ] = await Promise.all([
          getBassin(program.name),
          getBassinSLD(program.name),
          getPkSld(program.name),
        ]);
        
        if (bassinData) {
          setBassinData(bassinData);
          setBounds(calculateBounds(bassinData));
        }
        
        if (pkSLDData) {
          const pkSLDText = await pkSLDData.text();
          setPkStyles(parseSLDToStyles(pkSLDText));
        }
        
        if (bassinSLDData) {
          const bassinSLDText = await bassinSLDData.text();
          const styles = parseSLDToStyles(bassinSLDText);
          setBassinStyle({ color: styles[0]?.color || "var(--basic-black)", weight: styles[0]?.weight || 3 });
        }
        
        await streamPkData(program.name, setPkData);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };
    
    fetchData();
  }, [program]);
  
  /*
  "properties": {"pk": 3, "id_obj": 197, "code_bas": "1", "strahler": 1, "obj_ord_pk": "197_1_3", "catchment_id": 7075}
  */ 
  const getPkStyles = (feature: any): PathOptions => {
    const strahler = feature.properties?.strahler;
    
    for (const rule of pkStyles) {
      if (strahler >= rule.min && strahler <= rule.max){
        return { color: rule.color, weight: rule.weight };
      }
    }
    
    return { color: "var(--basic-black)", weight: 1 };
  };
  
  
  // Sélectionner la première variable par défaut
  useEffect(() => {
    if (program && program.variables && program.variables.length > 0) {
      setSelectedVariables([program.variables[0]]);
    }
  }, [program]);
  
  const request: DataRequest | null = useMemo(() => {
    if (!program || !amontAvalResponse || mode !== "amont-aval") return null;
    
    return {
      program: program.name,
      scenarios: selectedScenarios.map((scenario) => scenario.id),
      variables: selectedVariables.map((variable) => variable.toLowerCase()),
      pk: amontAvalResponse.pk || [],
    };
  }, [program, selectedScenarios, selectedVariables, amontAvalResponse, mode]);
  
  const requestFull: DataRequestFull | null = useMemo(() => {
    if (!program || mode !== "complet") return null;
    
    return {
      program: program.name,
      scenarios: selectedScenarios.map((scenario) => scenario.id),
      variables: selectedVariables.map((variable) => variable.toLowerCase()),
    };
  }, [program, selectedScenarios, selectedVariables, mode]);
  
  const requestColoredMap: ColorMapRequest | null = useMemo(() => {
    if (!program) return null;
    return {
      program : program.name,
      scenarios: selectedScenarios.map((scenario) => scenario.id),
      variables: selectedVariables.map((variable) => variable.toLowerCase()),
      decades: selectedDecades
    }
  }, [program, selectedScenarios, selectedVariables, selectedDecades]);
  
  
  useEffect(() => {
    if (!selectedVariables.length || !selectedScenarios.length) {
      setData(null);
      setChartData(null);
      setSelectedPk(undefined);
      setSelectedKey(null);
      return;
    }
    
    if(mode == "complet"){
      setAmontAvalResponse(null);
      setSelectedPk(undefined);
    }
    
    const fetchData = async () => {
      try {
        let response: DataResponse | null = null;
        if (mode === "amont-aval" && request) {
          response = await getData(request);
        } else if (mode === "complet" && requestFull) {
          response = await getFullData(requestFull);
        }
        
        if (response) {
          setData(response);
          const keys = Object.keys(response);
          if (keys.length > 0) {
            setSelectedKey(keys[0]);
            setChartData(response[keys[0]].data);
          }
        } else {
          setData(null);
          setChartData(null);
        }
        if(!requestColoredMap){
          return;
        }

      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setData(null);
        setChartData(null);
      }
    };
    
    fetchData();
  }, [request, requestFull, mode]);
  
  useEffect(() => {
    if (!requestColoredMap) return;
    getColoredMapData(requestColoredMap).then((data) => {
      setColoredMapData(data);
    });
  }, [requestColoredMap]);

  useEffect(() => {
    if (!data || !selectedKey || program == undefined) return;
    setChartData(data[selectedKey].data);
    
    const fetchPk = async () => {
      const response = await getPkGeom(program.name, selectedKey);
      if (response) {
        setSelectedPk(response);
      }
    };
    if(mode === "amont-aval"){
      fetchPk();
    } 
  }, [selectedKey]);
  
  const keyMapping = useMemo(() => {
    if (!data) return {};
    const keys = Object.keys(data);
    return keys.reduce((map, key, index) => {
      map[index + 1] = key;
      return map;
    }, {} as Record<number, string>);
  }, [data]);
  
  const min = useMemo(() => {
    const keys = Object.keys(keyMapping).map(Number);
    return keys.length > 0 ? Math.min(...keys) : 1;
  }, [keyMapping]);
  
  const max = useMemo(() => {
    const keys = Object.keys(keyMapping).map(Number);
    return keys.length > 0 ? Math.max(...keys) : 1;
  }, [keyMapping]);
  
  const handleSliderChange = (value: number) => {
    const newKey = keyMapping[value];
    if (newKey) {
      setSelectedKey(newKey);
    }
  };
  
  const handleDecadeChange = (value : number[]) => {
    setSelectedDecades(value);
  }
  
  // old S1 code
  useEffect(() => {
    const fetchScenarios = async () => {
      const data = await getScenarios();
      if (data) {
        setScenarios(data.scenarios);
        
        // Sélectionner les 3 premiers scénarios par défaut
        if (data.scenarios.length > 0) {
          const firstThreeScenarios = data.scenarios.slice(0, 3);
          setSelectedScenarios(firstThreeScenarios);
        } else {
          setSelectedScenarios(data.scenarios);
        }
      }
    };
    fetchScenarios();
  }, [setSelectedScenarios]);
  
  
  const fetchResults = async () => {
    if (idHydStart && idHydEnd) {
      const data = await getAmontAval(program!.name, idHydStart, idHydEnd);
      setAmontAvalResponse(data);
    }
  };
  
  useEffect(() => {
    if(idHydEnd === program?.exutoire_id || (idHydStart && idHydEnd)){
      fetchResults();
    }
  }, [idHydStart, idHydEnd]);
  
  const resetSelection = () => {
    setIdHydStart(null);
    setIdHydEnd(null);
    setAmontAvalResponse(null);
    setSelectedPk(undefined);
  };
  
  // old graph S1 code
  const decades = chartData?.length ? chartData.map((entry) => entry.decade) : [];
  const variablesGraph = chartData?.length 
  ? Object.keys(chartData[0]).filter((key) => key !== "decade") 
  : [];
  
  const groupedData: Record<
  string,
  { p5: number[]; p50: number[]; p90: number[] }
  > = {};
  
  variablesGraph.forEach((variableKey) => {
    const [baseVariable] = variableKey.split("_");
    if (!groupedData[baseVariable]) {
      groupedData[baseVariable] = { p5: [], p50: [], p90: [] };
    }
    if (chartData?.length) {
      chartData.forEach((entry) => {
        if (variableKey.endsWith("_p5"))
          groupedData[baseVariable].p5.push(entry[variableKey]);
        if (variableKey.endsWith("_p50"))
          groupedData[baseVariable].p50.push(entry[variableKey]);
        if (variableKey.endsWith("_p90"))
          groupedData[baseVariable].p90.push(entry[variableKey]);
      });
    }
  });
  
  if (!program) {
    navigate("/");
    return null;
  }
  
  return (
    <div className='home_component_visualisation'>
    
    {/* Section Paramètrage Général */}
    <div className='home_body'>
    <ToggleContainer title="Carte de sélection">
    <MapSelection
    program={program.name}
    exutoire_id={program.exutoire_id}
    idHydStart={idHydStart}
    idHydEnd={idHydEnd}
    setIdHydStart={setIdHydStart}
    setIdHydEnd={setIdHydEnd}
    amontAvalResponse={amontAvalResponse}
    selectedPk={selectedPk}
    mode={mode}
    handleSliderChange={handleSliderChange}
    min={min}
    max={max}
    resetSelection={resetSelection}
    variables={program.variables}
    selectedVariables={selectedVariables}
    setSelectedVariables={setSelectedVariables}
    selectedScenarios={selectedScenarios}
    setSelectedScenarios={setSelectedScenarios}
    scenarios={scenarios}
    setMode={setMode}
    />
    </ToggleContainer>
    {chartData?.length &&
      <ToggleContainer title="Graphiques temporels" containsTile={true}>
      {Object.entries(groupedData).map(([variable, chartData], index) => (
        <VariableChart
        key={variable}
        className={`variable_chart chart_${index}`} 
        variable={variable}
        decades={decades}
        data={chartData}
        />
      ))}
      </ToggleContainer>
    }
    {coloredMapData &&
      <ToggleContainer title="Carte des seuils" containsTile={true} secondChild={
        <DecadeRangeComponent onChange={handleDecadeChange} min={1} max={36} leftLabel={'Première décade'} rightLabel={'dernière décade'} />
      }
        children = {
          Object.entries(coloredMapData.legend).map(([variable, __], index) => (
            <ColoredMapComponent 
              key={variable}
              data={coloredMapData}
              variable={variable}
              className={`variable_chart chart_${index}`} 
              pkData={pkData} 
              pkStyles={[]} 
              bassinData={bassinData} 
              bassinStyle={bassinStyle} 
              bounds={bounds} 
              getPkStyles={getPkStyles}          
            />
          ))
        }
      >
      </ToggleContainer>
    }
    </div>
    </div>
  );
};

export default VisualisationPage;
