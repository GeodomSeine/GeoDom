import React, { useState, useEffect, useMemo } from "react";
import { useProgram } from "../../contexts/ProgramContext";
import './VisualisationPage.scss';
import { getScenarios, getAmontAval, Scenario, AmontAvalResponse, DataRequest, DataResponse, getData, getFullData, DataRequestFull, GeoJsonResponse, getPkGeom, ColoredMapResponseData, ColorMapRequest, getColoredMapData } from "../../services/api";
import { useNavigate } from "react-router";
import ToggleContainer from "./ToggleComponent";
import VariableChart from "../SimpleComponents/VariableChart";
import MapSelection from "../MapSelection/MapSelection";
import ColoredMapComponent from "../ColoredMapComponent/ColoredMapComponent";
import DecadeRangeComponent from "../SimpleComponents/DecadeRangeComponent";
  
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
        
        let coloredResponse = await getColoredMapData(requestColoredMap);
        if(coloredResponse){
          setColoredMapData(coloredResponse);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setData(null);
        setChartData(null);
        setColoredMapData(null);
      }
    };
    
    fetchData();
  }, [requestColoredMap, request, requestFull, mode]);
  
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
        <ToggleContainer title="Graph" containsTile={true}>
              {Object.entries(groupedData).map(([variable, chartData], index) => (
                <VariableChart
                    key={variable}
                    className={`variable-chart chart-${index}`} 
                    variable={variable}
                    decades={decades}
                    data={chartData}
                />
              ))}
        </ToggleContainer>
      }
      {coloredMapData &&
        <ToggleContainer title="Profil en long" containsTile={true} secondChild={
            <DecadeRangeComponent onChange={handleDecadeChange} min={1} max={36} leftLabel={'Première décade'} rightLabel={'dernière décade'} />
          }
          children = {
            Object.entries(coloredMapData.legend).map(([variable, __], index) => (
              <ColoredMapComponent data={coloredMapData} variable={variable} className={`variable-chart chart-${index}`}/>
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
