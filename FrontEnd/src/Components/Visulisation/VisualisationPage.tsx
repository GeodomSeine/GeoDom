import React, { useState, useEffect, useMemo } from "react";
import { useProgram } from "../../contexts/ProgramContext";
import './VisualisationPage.scss';
import { getScenarios, getAmontAval, Scenario, AmontAvalResponse, DataRequest, DataResponse, getData, getFullData, DataRequestFull, GeoJsonResponse, getPkGeom } from "../../services/api";
import { useNavigate } from "react-router";
import ToggleContainer from "./ToggleComponent";
import VariableChart from "../SimpleComponents/VariableChart";
import MapSelection from "../MapSelection/MapSelection";



const VisualisationPage: React.FC = () => {
  const { program } = useProgram();
  const navigate = useNavigate();
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([]);
  const [amontAvalResponse, setAmontAvalResponse] = useState<AmontAvalResponse | null>(null);
  
  const [data, setData] = useState<DataResponse | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null); 
  type ChartData = Array<{
    decade: number;
    [variable: string]: number;
  }>;
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
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setData(null);
        setChartData(null);
      }
    };
    
    fetchData();
  }, [request, requestFull, mode]);
  
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
  
  const min = useMemo(() => Math.min(...Object.keys(keyMapping).map(Number)), [keyMapping]);
  const max = useMemo(() => Math.max(...Object.keys(keyMapping).map(Number)), [keyMapping]);
  
  const handleSliderChange = (value: number) => {
    const newKey = keyMapping[value];
    if (newKey) {
      setSelectedKey(newKey);
    }
  };

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
  
  
  // not the best code, because it forced the click on the href when updated
  // const handleExportJson = (): void => {
  //   const data = {
  //     name : program,
  //     complete : selectedKey !== null, 
  //     selected_order : selectedKey, 
  //     pk_start : idHydStart,
  //     pk_end : idHydEnd,
  //     selected_pk : selectedPk,
  //     variables : selectedVariables,
  //     scenarios : selectedScenarios
  
  // };
  //   const jsonString = JSON.stringify(data, null, 2);
  //   const blob = new Blob([jsonString], { type: "application/json" });
  
  //   const url = URL.createObjectURL(blob);
  
  //   const downloadLink = document.querySelector("a.logo_container") as HTMLAnchorElement | null;
  //   if (downloadLink) {
  //       downloadLink.href = url;
  //       downloadLink.download = data.name?.name + ".json";
  //       downloadLink.click(); 
  //   }
  // };
  
  
  if (!program) {
    navigate("/");
    return null;
  }
  
  return (
    <div className='home_component_visualisation'>
    
    {/* <HeaderComponent actionButton={handleExportJson}/> */}
    {/* Section Paramètrage Général */}
      <div className='home_body'>
        <ToggleContainer title="Map">
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
          {/* <ControlComponent
            idHydStart={idHydStart}
            idHydEnd={idHydEnd}
            resetSelection={resetSelection}
            variables={program.variables}
            selectedVariables={selectedVariables}
            setSelectedVariables={setSelectedVariables}
            selectedScenarios={selectedScenarios}
            setSelectedScenarios={setSelectedScenarios}
            scenarios={scenarios}
            mode={mode}
            setMode={setMode}
          /> */}
        </ToggleContainer>
      {chartData?.length &&
        <ToggleContainer title="Graph">
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
      {chartData?.length &&
        <ToggleContainer title="Graph">
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

        
        {/* <S1
          program={program.name}
          exutoire_id={program.exutoire_id}
          variables={program.variables}
          selectedVariables={selectedVariables}
          setSelectedVariables={setSelectedVariables}
          selectedScenarios={selectedScenarios}
          setSelectedScenarios={setSelectedScenarios}
          setAmontAvalResponse={setAmontAvalResponse}
          amontAvalResponse={amontAvalResponse}
          selectedPk={selectedPk}
          setSelectedPk={setSelectedPk}
          idHydStart={idHydStart}
          setIdHydStart={setIdHydStart}
          idHydEnd={idHydEnd}
          setIdHydEnd={setIdHydEnd}
          scenarios={scenarios}
          setScenarios={setScenarios}
          mode={mode}
          setMode={setMode}
          min={min}
          max={max}
          sliderChange={handleSliderChange}
          data={chartData}
          /> */}
          {/* <Esapce3Component program={program.name}/> */}
          </div>
        </div>
      );
    };
    
    export default VisualisationPage;
