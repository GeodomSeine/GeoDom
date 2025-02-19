import React, { useState, useEffect, useMemo } from "react";
import './VisualisationPage.scss';
import { getScenarios, getAmontAval, Scenario, AmontAvalResponse, DataRequest, DataResponse, getData, getFullData, DataRequestFull, GeoJsonResponse, getPkGeom, ColoredMapResponseData, ColorMapRequest, getColoredMapData, getBassin, getBassinSLD, getPkSld, streamPkData, ProfileGraphDataResponse, ProfileGraphPkRequest, getProfileData, getProfileFullData, ProgramVariable, Program } from "../../services/api";
import { useNavigate, useParams } from "react-router";
import ToggleContainer from "./ToggleComponent";
import VariableChart from "../SimpleComponents/VariableChart";
import MapSelection from "../MapSelection/MapSelection";
import ColoredMapComponent from "../ColoredMapComponent/ColoredMapComponent";
import DecadeRangeComponent from "../SimpleComponents/DecadeRangeComponent";
import { LatLngBounds, PathOptions } from "leaflet";
import { calculateBounds } from "../../utils/mapUtils";
import { parseSLDToStyles } from "../../mapstyles/mapStyles";
import SliderComponent from "../SimpleComponents/SliderComponent";
import ProfileGraph from "../SimpleComponents/ProfileGraph";
import FloatingAction from "../SimpleComponents/FloatingAction";
import ExportJsonComponent from "../ExportComponent/ExportJsonComponent";
import PercentileSelector from "../SimpleComponents/PercentileSelector";

type ChartData = Array<{
  decade: number;
  [variable: string]: number;
}>;

const VisualisationPage: React.FC = () => {
  const { program_name } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [selectedVariables, setSelectedVariables] = useState<ProgramVariable[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<Scenario[]>([]);
  const [amontAvalResponse, setAmontAvalResponse] = useState<AmontAvalResponse | null>(null);
  const [selectedDecades, setSelectedDecades] = useState<number[]>([1, 36]);
  const [data, setData] = useState<DataResponse | null>(null);
  const [coloredMapData, setColoredMapData] = useState<ColoredMapResponseData | null>(null);
  const [profileGraphData, setProfileGraphData] = useState<ProfileGraphDataResponse | null>(null);
  const [selectedPercentile, setSelectedPercentile] = useState<"p5" | "p50" | "p90">("p50");
  const [selectedKey, setSelectedKey] = useState<string | null>(null); 
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedPk, setSelectedPk] = useState<GeoJsonResponse | undefined>(undefined);
  const [idHydStart, setIdHydStart] = useState<number | null>(null);
  const [idHydEnd, setIdHydEnd] = useState<number | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [mode, setMode] = useState<"complet" | "amont-aval">("complet");
  const [pkData, setPkData] = useState<GeoJsonResponse | null>(null);
  const [pkStyles, setPkStyles] = useState<any[]>([]);
  const [bassinData, setBassinData] = useState<GeoJsonResponse | null>(null);
  const [bassinStyle, setBassinStyle] = useState<PathOptions | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(1);
  const conf = localStorage.getItem("confImportation");

  useEffect(() => {
    if (!program_name) {
      navigate("/");
      return;
    }
    const storedPrograms = localStorage.getItem("programs");
    if (storedPrograms) {
      const programs: Program[] = JSON.parse(storedPrograms);
      const foundProgram = programs.find(prog => prog.name === program_name);

      if (foundProgram) {
        setProgram(foundProgram);
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [program_name, navigate]);

  useEffect(() => {
    const fetchScenarios = async () => {
      const data = await getScenarios();
      if (data) {
        setScenarios(data.scenarios);
        setSelectedScenarios(data.scenarios.slice(0, 3));
      }
    };
    fetchScenarios();
  }, []);

  useEffect(() => {
    if (program && program.variables && program.variables.length > 0) {
      setSelectedVariables([program.variables[0]]);
    }
  }, [program]);

  useEffect(() => {
    if (conf && program && scenarios.length > 0) {
      try {
        const jsonData = JSON.parse(conf);
        setSelectedVariables(program.variables.filter((variable) => jsonData.variables.includes(variable.var_code)) || []);
        setSelectedScenarios(scenarios.filter((scenario) => jsonData.scenarios.includes(scenario.id)));
        setIdHydStart(jsonData.hydro_id_start);
        setIdHydEnd(jsonData.hydro_id_end);
        if (jsonData.hydro_id_start && jsonData.hydro_id_end) {
          setMode("amont-aval");
          setSelectedPk(jsonData.selected);
        } else {
          setMode("complet");
        }
        setSelectedKey(jsonData.selected);
        setSelectedDecades(jsonData.decades);
        setSliderValue(jsonData.selectedSliderValue);
        localStorage.removeItem("confImportation");
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  }, [conf, program, scenarios]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!program) return;

      try {
        const [bassinData, bassinSLDData, pkSLDData] = await Promise.all([
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

    fetchInitialData();
  }, [program]);

  const request: DataRequest | null = useMemo(() => {
    if (!program || !amontAvalResponse || mode !== "amont-aval") return null;
    return {
      program: program.name,
      scenarios: selectedScenarios.map((scenario) => scenario.id),
      variables: selectedVariables.map((variable) => variable.var_code.toLowerCase()),
      pk: amontAvalResponse.pk || [],
    };
  }, [program, selectedScenarios, selectedVariables, amontAvalResponse, mode]);

  const requestFull: DataRequestFull | null = useMemo(() => {
    if (!program || mode !== "complet") return null;
    return {
      program: program.name,
      scenarios: selectedScenarios.map((scenario) => scenario.id),
      variables: selectedVariables.map((variable) => variable.var_code.toLowerCase()),
    };
  }, [program, selectedScenarios, selectedVariables, mode]);

  const requestColoredMap: ColorMapRequest | null = useMemo(() => {
    if (!program) return null;
    return {
      program: program.name,
      scenarios: selectedScenarios.map((scenario) => scenario.id),
      variables: selectedVariables.map((variable) => variable.var_code.toLowerCase()),
      decades: selectedDecades
    };
  }, [program, selectedScenarios, selectedVariables, selectedDecades]);

  const profileDataRequest: ProfileGraphPkRequest | null = useMemo(() => {
    if (!program || !amontAvalResponse || mode !== "amont-aval") return null;
    return {
      program: program.name,
      scenarios: selectedScenarios.map((scenario) => scenario.id),
      variables: selectedVariables.map((variable) => variable.var_code.toLowerCase()),
      pk: amontAvalResponse.pk || [],
      decades: selectedDecades
    };
  }, [program, selectedScenarios, selectedVariables, amontAvalResponse, mode, selectedDecades]);

  useEffect(() => {
    if (!selectedVariables.length || !selectedScenarios.length) {
      setData(null);
      setChartData(null);
      setSelectedPk(undefined);
      setSelectedKey(null);
      return;
    }

    if (mode === "complet") {
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

    if (mode === "amont-aval" && profileDataRequest) {
      getProfileData(profileDataRequest).then((data) => {
        setProfileGraphData(data);
      });
    }
    fetchData();
  }, [request, requestFull, mode, profileDataRequest]);

  useEffect(() => {
    if (!requestColoredMap) return;
    getColoredMapData(requestColoredMap).then((data) => {
      setColoredMapData(data);
    });
    getProfileFullData(requestColoredMap).then((data) => {
      setProfileGraphData(data);
    });
  }, [requestColoredMap]);

  useEffect(() => {
    if (!data || !selectedKey || !program) return;
    setChartData(data[selectedKey].data);

    const fetchPk = async () => {
      const response = await getPkGeom(program.name, selectedKey);
      if (response) {
        setSelectedPk(response);
      }
    };
    if (mode === "amont-aval") {
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
    setSliderValue(value);
    const newKey = keyMapping[value];
    if (newKey) setSelectedKey(newKey);
  };

  const handleDecadeChange = (value: number[]) => {
    setSelectedDecades(value);
  };

  const fetchResults = async () => {
    if (idHydStart && idHydEnd) {
      const data = await getAmontAval(program!.name, idHydStart, idHydEnd);
      setAmontAvalResponse(data);
    }
  };

  useEffect(() => {
    if (idHydEnd === program?.exutoire_id || (idHydStart && idHydEnd)) {
      fetchResults();
    }
  }, [idHydStart, idHydEnd]);

  const resetSelection = () => {
    setIdHydStart(null);
    setIdHydEnd(null);
    setAmontAvalResponse(null);
    setSelectedPk(undefined);
  };

  const getPkStyles = (feature: any): PathOptions => {
    const strahler = feature.properties?.strahler;
    for (const rule of pkStyles) {
      if (strahler >= rule.min && strahler <= rule.max) {
        return { color: rule.color, weight: rule.weight };
      }
    }
    return { color: "var(--basic-black)", weight: 1 };
  };

  const sharedSlider = (
    <SliderComponent
      value={sliderValue}
      min={min}
      max={max}
      step={1}
      onChange={handleSliderChange}
      leftLabel={mode === "amont-aval" ? "Pk min" : "Strahler min"}
      rightLabel={mode === "amont-aval" ? "Pk max" : "Strahler max"}
    />
  );

  const sharedDecadePercentile = (
    <div className='decade_percentile_selection'>
      <DecadeRangeComponent
        value={selectedDecades}
        onChange={handleDecadeChange}
        min={1}
        max={36}
        leftLabel={'Première décade'}
        rightLabel={'dernière décade'}
      />
      <PercentileSelector selectedPercentile={selectedPercentile} onChange={setSelectedPercentile} />
    </div>
  )

  const decades = chartData?.length ? chartData.map((entry) => entry.decade) : [];
  const variablesGraph = chartData?.length
    ? Object.keys(chartData[0]).filter((key) => key !== "decade")
    : [];

  const groupedData: Record<string, { p5: number[]; p50: number[]; p90: number[] }> = {};

  variablesGraph.forEach((variableKey) => {
    const [baseVariable] = variableKey.split("_");
    if (!groupedData[baseVariable]) {
      groupedData[baseVariable] = { p5: [], p50: [], p90: [] };
    }
    if (chartData?.length) {
      chartData.forEach((entry) => {
        if (variableKey.endsWith("_p5")) groupedData[baseVariable].p5.push(entry[variableKey]);
        if (variableKey.endsWith("_p50")) groupedData[baseVariable].p50.push(entry[variableKey]);
        if (variableKey.endsWith("_p90")) groupedData[baseVariable].p90.push(entry[variableKey]);
      });
    }
  });

  if (!program) {
    return null;
  }

  const exportConf = {
    name: program.name,
    selected: selectedKey,
    selectedSliderValue: sliderValue,
    hydro_id_start: idHydStart,
    hydro_id_end: idHydEnd,
    variables: selectedVariables.map((variable) => variable.var_code),
    scenarios: selectedScenarios.map((scenario) => scenario.id),
    decades: selectedDecades
  };

  return (
    <div className='home_component_visualisation'>
      <FloatingAction>
        <ExportJsonComponent exportConf={exportConf} />
      </FloatingAction>
      <div className='home_body'>
        <ToggleContainer title="Carte de sélection" secondChild={sharedSlider}>
          <MapSelection
            program={program!.name}
            exutoire_id={program!.exutoire_id}
            idHydStart={idHydStart}
            idHydEnd={idHydEnd}
            setIdHydStart={setIdHydStart}
            setIdHydEnd={setIdHydEnd}
            amontAvalResponse={amontAvalResponse}
            selectedPk={selectedPk}
            mode={mode}
            resetSelection={resetSelection}
            variables={program!.variables}
            selectedVariables={selectedVariables}
            setSelectedVariables={setSelectedVariables}
            selectedScenarios={selectedScenarios}
            setSelectedScenarios={setSelectedScenarios}
            scenarios={scenarios}
            setMode={setMode}
          />
        </ToggleContainer>
        {chartData?.length && (
          <ToggleContainer title="Graphiques temporels" containsTile={true} secondChild={sharedSlider}>
            {Object.entries(groupedData).map(([variable, chartData], index) => (
              <VariableChart
                key={variable}
                className={`variable_element element_${index}`}
                variable={program!.variables.find((v) => v.var_code.toLowerCase() === variable.toLowerCase()) || { var_code: variable, var_name: variable, unit_short: "" }}
                decades={decades}
                data={chartData}
              />
            ))}
          </ToggleContainer>
        )}
        {coloredMapData && (
          <ToggleContainer
            title="Carte des seuils"
            containsTile={true}
            secondChild={sharedDecadePercentile}
          >
            {Object.entries(coloredMapData.legend).map(([variable, __], index) => (
              <ColoredMapComponent
                key={variable}
                data={coloredMapData}
                variable={program!.variables.find((v) => v.var_code.toLowerCase() === variable.toLowerCase()) || { var_code: variable, var_name: variable, unit_short: "" }}
                className={`variable_element element_${index}`}
                pkData={pkData}
                pkStyles={[]}
                bassinData={bassinData}
                bassinStyle={bassinStyle}
                bounds={bounds}
                getPkStyles={getPkStyles}
                percentile={selectedPercentile}
              />
            ))}
          </ToggleContainer>
        )}
        {profileGraphData && (
          <ToggleContainer title="Profil en long" containsTile={true} secondChild={sharedDecadePercentile}>
            {selectedVariables.map((variable, index) => (
              <ProfileGraph
                className={`variable_element element_${index}`}
                key={`profile_${variable}`}
                variable={variable}
                data={profileGraphData}
                xKey={mode === "amont-aval" ? "PK" : "Strahler"}
              />
            ))}
          </ToggleContainer>
        )}
      </div>
    </div>
  );
};

export default VisualisationPage;
