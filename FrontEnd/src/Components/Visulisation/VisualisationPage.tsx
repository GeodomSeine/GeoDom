import React, { useState, useEffect, useMemo, useRef } from "react";
import './VisualisationPage.scss';
import {
  getScenarios, getAmontAval, Scenario,
  AmontAvalResponse, DataRequest, DataResponse,
  getData, getFullData, DataRequestFull, GeoJsonResponse,
  getPkGeom, ColoredMapResponseData, ColorMapRequest,
  getColoredMapData, getBassin, getBassinSLD, getPkSld,
  streamPkData, ProfileGraphDataResponse,
  ProfileGraphPkRequest, getProfileData, getProfileFullData,
  ProgramVariable, Program, getDonutsData, getDonutsFullData,
  DonutsDataResponse,
  getPkGeomByStrahler
} from "../../services/api";
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
import ExportPdfComponent from "../ExportComponent/ExportPdfComponent";
import PercentileSelector from "../SimpleComponents/PercentileSelector";
import { scenarioColorPalette } from "../../utils/scenarioColorPalette";
import ExportCsvComponent from "../ExportComponent/ExportCsvComponent";
import ExportGeoPackageComponent from "../ExportComponent/ExportGeoPackageComponent";

const scenarioColors: Record<number, string> = {}

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
  const [donutsData, setDonutsData] = useState<DonutsDataResponse | null>(null);

  const [coloredMapData, setColoredMapData] = useState<ColoredMapResponseData | null>(null);
  const [profileGraphData, setProfileGraphData] = useState<ProfileGraphDataResponse | null>(null);
  const [selectedPercentile, setSelectedPercentile] = useState<"p5" | "p50" | "p90">("p50");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedPk, setSelectedPk] = useState<GeoJsonResponse | undefined>(undefined);
  const [pkByStrahler, setPkByStrahler] = useState<GeoJsonResponse | undefined>(undefined);

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

        const scenariosWithColors = data.scenarios.map((scenario, index) => {
          if (!scenarioColors[scenario.id]) {
            scenarioColors[scenario.id] = scenarioColorPalette[index % scenarioColorPalette.length];
          }
          return { ...scenario, color: scenarioColors[scenario.id] };
        });

        setScenarios(scenariosWithColors);
        setSelectedScenarios(scenariosWithColors.slice(0, 3));
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
    if (!program || !program.name || selectedScenarios.length==0|| selectedVariables.length==0 || selectedDecades.length==0) return null;
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
      setDonutsData(null);
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
        let donutsResponse: DonutsDataResponse | null = null;

        if (mode === "amont-aval" && request) {
          [response, donutsResponse] = await Promise.all([
            getData(request),
            getDonutsData(request)
          ]);

        } else if (mode === "complet" && requestFull) {
          [response, donutsResponse] = await Promise.all([
            getFullData(requestFull),
            getDonutsFullData(requestFull)
          ]);
        }
        if (donutsResponse) {
          setDonutsData(donutsResponse);
        } else {
          setDonutsData(null);
        }
        if (response) {
          setData(response);
          const keys = Object.keys(response);
          if (keys.length > 0) {
            setSelectedKey(keys[0]);
            setChartData(response[keys[0]].data as ChartData);
          }
        } else {
          setData(null);
          setChartData(null);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setData(null);
        setChartData(null);
        setDonutsData(null);
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
    setChartData(data[selectedKey].data as ChartData);

    const fetchPk = async () => {
      const response = await getPkGeom(program.name, selectedKey);
      if (response) {
        setSelectedPk(response);
      }
    };

    const fetchPkByStrahler = async () => {
      const response = await getPkGeomByStrahler(program.name, Number.parseInt(selectedKey));
      if (response) {
        setPkByStrahler(response);
      }
    }

    if (mode === "amont-aval") {
      fetchPk();
    }else {
      fetchPkByStrahler();
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

  // sharedSlider
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

  // sharedDecadeSlider
  const sharedDecade = (
      <DecadeRangeComponent
        value={selectedDecades}
        onChange={handleDecadeChange}
        min={1}
        max={36}
      />
  )

  const decades = chartData?.length ? chartData.map((entry) => entry.decade) : [];
  const variablesGraph = chartData?.length ? Object.keys(chartData[0]).filter((key) => key !== "decade") : [];

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

  const selectionMapRef = useRef<null>(null);
  const testRef = useRef<null>(null);
  const exportPdfInfo = {
    selectionMapElements: { mapRef: selectionMapRef, program_name: program_name, selectedVariables: selectedVariables, selectedScenarios: selectedScenarios },
    mapElements: [],
    chartElements: { testRef: testRef },
  };


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

  const exportData = {
    program: program.name,
    id_hyd_start: idHydStart,
    id_hyd_end: idHydEnd,
    mode: mode,
    pynutsData: data,
    donutsData: donutsData,
    variables: selectedVariables,
    scenarios: selectedScenarios,
  }

  return (
    <div className='home_component_visualisation'>
      <FloatingAction>
        <ExportJsonComponent exportConf={exportConf}/>
        <ExportPdfComponent exportPdfInfo={exportPdfInfo}/>
        {data && <ExportCsvComponent exportCsvData={exportData}/>}
        <ExportGeoPackageComponent program={program!.name} />
      </FloatingAction>
      <div className='home_body'>
        <ToggleContainer className="space_container_1" title="Carte de sélection" secondChild={sharedSlider}>
          <MapSelection
            mapRef={selectionMapRef}
            scenarioColors={scenarioColors}
            program={program!.name}
            exutoire_id={program!.exutoire_id}
            idHydStart={idHydStart}
            idHydEnd={idHydEnd}
            setIdHydStart={setIdHydStart}
            setIdHydEnd={setIdHydEnd}
            amontAvalResponse={amontAvalResponse}
            selectedPk={mode === "amont-aval" ? selectedPk: undefined}
            mode={mode}
            resetSelection={resetSelection}
            variables={program!.variables}
            selectedVariables={selectedVariables}
            setSelectedVariables={setSelectedVariables}
            selectedScenarios={selectedScenarios}
            setSelectedScenarios={setSelectedScenarios}
            scenarios={scenarios}
            setMode={setMode}
            pkByStrahler={mode === "complet" ? pkByStrahler: undefined}
          />
        </ToggleContainer>
        {chartData?.length && (

          <ToggleContainer className="space_container_2" title="Graphiques temporels" containsTile={true} secondChild={sharedSlider}>

            {Object.entries(groupedData).map(([variable, chartData], index) => (
              <VariableChart
                scenarios={scenarios}
                scenarioColors={scenarioColors}
                donutsData={selectedKey && donutsData && donutsData[selectedKey] ? donutsData[selectedKey][variable] : {}}
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
            className="space_container_3"
            secondChild={
              <div className='decade_percentile_selection'>
                {sharedDecade}
                <PercentileSelector selectedPercentile={selectedPercentile} onChange={setSelectedPercentile} />
              </div>}
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
          <ToggleContainer className="space_container_4" title="Profil en long" containsTile={true} secondChild={sharedDecade}>
            {selectedVariables.map((variable, index) => (
              <ProfileGraph
                className={`variable_element element_${index}`}
                key={`profile_${variable}`}
                variable={variable}
                data={profileGraphData}
                xKey={mode === "amont-aval" ? "PK" : "Strahler"}
                donutsData={donutsData!}
                scenarioColors={scenarioColors}
                scenarios={selectedScenarios}
                decades={selectedDecades && selectedDecades.length == 2 ? [selectedDecades[0], selectedDecades[1]] : [1, 10]}
              />
            ))}
          </ToggleContainer>
        )}
      </div>
    </div>
  );
};

export default VisualisationPage;
