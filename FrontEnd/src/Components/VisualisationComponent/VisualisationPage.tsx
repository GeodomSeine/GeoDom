import React, { useState, useEffect, useMemo } from "react";
import Espace1Component from "../Espace1Component/Espace1Component";
import { useProgram } from "../../contexts/ProgramContext";
import HeaderComponent from "../HeaderComponent/HeaderComponent";
import Espace2Component from "../Espace2Component/Espace2Component";
import './VisualisationPage.scss';
import { Scenario, AmontAvalResponse, DataRequest, DataResponse, getData, getFullData, DataRequestFull, GeoJsonResponse, getPkGeom } from "../../services/api";
import { useNavigate } from "react-router";
import Esapce3Component from "../Espace3Component/Espace3Component";


const VisualisationPage: React.FC = () => {
  const { program } = useProgram();
  const navigate = useNavigate();

  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([]);
  const [amontAvalResponse, setAmontAvalResponse] = useState<AmontAvalResponse | null>(null);
  const [data, setData] = useState<DataResponse | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null); 
  const [chartData, setChartData] = useState<any | null>(null);
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

  if (!program) {
    navigate("/");
    return null;
  }

  return (
    <div className='home_component'>

      
      <HeaderComponent program={program.name} selectedVariables={selectedVariables} selectedScenarios={selectedScenarios} idHydStart={idHydStart} idHydEnd={idHydEnd} selectedPk={selectedPk} selectedStralher={selectedKey}/>
      {/* Section Paramètrage Général */}
        <div className='home_body'>
        <Espace1Component
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
        />
        {chartData && (
          <Espace2Component
            min={min}
            max={max}
            sliderChange={handleSliderChange}
            data={chartData}
            mode={mode}
          />
        )}
        <Esapce3Component program={program.name}/>
      </div>
    </div>
  );
};

export default VisualisationPage;
