// import React, { useEffect} from 'react';
// import MapSelection from '../MapSelection/MapSelection';
// // import ControlComponent from './ControlComponent';
// import ToggleContainer from '../Visulisation/ToggleComponent';
// import './S1.scss';
// import { getAmontAval, AmontAvalResponse, Scenario, GeoJsonResponse } from '../../services/api';
// import { getScenarios } from '../../services/api';
// import SliderComponent from '../SimpleComponents/SliderComponent';
// import VariableChart from '../SimpleComponents/VariableChart';
// import ControlComponent from '../MapSelection/ControlComponent';

// interface Espace1ComponentProps {
//   program: string;
//   exutoire_id: number;
//   variables: string[];
//   selectedVariables: string[];
//   setSelectedVariables: (variables: string[]) => void;
//   selectedScenarios: Scenario[];
//   setSelectedScenarios: (scenarios: Scenario[]) => void;
//   setAmontAvalResponse: (response: AmontAvalResponse | null) => void;
//   amontAvalResponse: AmontAvalResponse | null;
//   selectedPk?: GeoJsonResponse;
//   setSelectedPk: (pk: GeoJsonResponse | undefined) => void;
//   idHydStart : number | null;
//   setIdHydStart : (id : number | null) => void;
//   idHydEnd : number | null;
//   setIdHydEnd : (id : number | null) => void;
//   scenarios : Scenario[];
//   setScenarios : (scenario : Scenario[]) => void;
//   setMode: (mode: "complet" | "amont-aval") => void;
//   sliderChange: (value: number) => void;
//   min :number;
//   max :number;
//   data: Array<{
//     decade: number;
//     [variable: string]: number;
//   }>;
//   mode: "complet" | "amont-aval";
// }

// //props need to be clean
// const ParentComponent: React.FC<Espace1ComponentProps> = ({
//   program,
//   exutoire_id,
//   variables,
//   selectedVariables,
//   setSelectedVariables,
//   selectedScenarios,
//   setSelectedScenarios,
//   setAmontAvalResponse,
//   amontAvalResponse,
//   selectedPk,
//   setSelectedPk,
//   idHydStart,
//   setIdHydStart,
//   idHydEnd,
//   setIdHydEnd,
//   scenarios,
//   setScenarios, 
//   mode,
//   setMode,
//   sliderChange,
//   data,
//   min, 
//   max,
// }) => {


//   //map
//   useEffect(() => {
//     const fetchScenarios = async () => {
//       const data = await getScenarios();
//       if (data) {
//         setScenarios(data.scenarios);
  
//         // Sélectionner les 3 premiers scénarios par défaut
//         if (data.scenarios.length > 0) {
//           const firstThreeScenarios = data.scenarios.slice(0, 3);
//           setSelectedScenarios(firstThreeScenarios);
//         } else {
//           setSelectedScenarios(data.scenarios);
//         }
//       }
//     };
//     fetchScenarios();
//   }, [setSelectedScenarios]);
  

//   const fetchResults = async () => {
//     if (idHydStart && idHydEnd) {
//       const data = await getAmontAval(program, idHydStart, idHydEnd);
//       setAmontAvalResponse(data);
//     }
//   };

//   useEffect(() => {
//     if(idHydEnd === exutoire_id || (idHydStart && idHydEnd)){
//       fetchResults();
//     }
//   }, [idHydStart, idHydEnd]);

//   const resetSelection = () => {
//     setIdHydStart(null);
//     setIdHydEnd(null);
//     setAmontAvalResponse(null);
//     setSelectedPk(undefined);
//   };

//   // graph
//   const decades = data?.length ? data.map((entry) => entry.decade) : [];
//   const variablesGraph = data?.length 
//   ? Object.keys(data[0]).filter((key) => key !== "decade") 
//   : [];

//   const groupedData: Record<
//     string,
//     { p5: number[]; p50: number[]; p90: number[] }
//   > = {};

//   variablesGraph.forEach((variableKey) => {
//     const [baseVariable] = variableKey.split("_");
//     if (!groupedData[baseVariable]) {
//       groupedData[baseVariable] = { p5: [], p50: [], p90: [] };
//     }
//     if (data?.length) {
//       data.forEach((entry) => {
//         if (variableKey.endsWith("_p5"))
//           groupedData[baseVariable].p5.push(entry[variableKey]);
//         if (variableKey.endsWith("_p50"))
//           groupedData[baseVariable].p50.push(entry[variableKey]);
//         if (variableKey.endsWith("_p90"))
//           groupedData[baseVariable].p90.push(entry[variableKey]);
//       });
//     }
//   });

//   return (
//     <div className='space1'>
//       <ToggleContainer title="Map">
//         {/* <MapSelection
//           program={program}
//           exutoire_id={exutoire_id}
//           idHydStart={idHydStart}
//           idHydEnd={idHydEnd}
//           setIdHydStart={setIdHydStart}
//           setIdHydEnd={setIdHydEnd}
//           amontAvalResponse={amontAvalResponse}
//           selectedPk={selectedPk}
//           mode={mode}
//         /> */}
//         <ControlComponent
//           idHydStart={idHydStart}
//           idHydEnd={idHydEnd}
//           resetSelection={resetSelection}
//           variables={variables}
//           selectedVariables={selectedVariables}
//           setSelectedVariables={setSelectedVariables}
//           selectedScenarios={selectedScenarios}
//           setSelectedScenarios={setSelectedScenarios}
//           scenarios={scenarios}
//           mode={mode}
//           setMode={setMode}
//         />
//         <SliderComponent min={min} max={max} step={1} onChange={sliderChange} leftLabel={mode == "amont-aval" ? "Pk min" : "Strahler min"} rightLabel={mode == "amont-aval" ? "Pk max" : "Strahler max"}/>
//       </ToggleContainer>
//       {data?.length &&
//       <ToggleContainer title="Graph">
//         {Object.entries(groupedData).map(([variable, chartData], index) => (
//           <VariableChart
//             key={variable}
//             className={`variable-chart chart-${index}`} 
//             variable={variable}
//             decades={decades}
//             data={chartData}
//           />
//         ))}
//       </ToggleContainer>}
//       <ToggleContainer title="SuperMap">
//       {Object.entries(groupedData).map(([variable, chartData], index) => (
//           <VariableChart
//             key={variable}
//             className={`variable-chart chart-${index}`} 
//             variable={variable}
//             decades={decades}
//             data={chartData}
//           />
//         ))}
//       </ToggleContainer>
//     </div>
//   );
// };

// {/* OLD CODE UNCOMMENT AT YOUR OWN RISKS */}
//       {/* <ToggleContainer title="Paramètrage général">
//         <MapComponent
//           program={program}
//           exutoire_id={exutoire_id}
//           idHydStart={idHydStart}
//           idHydEnd={idHydEnd}
//           setIdHydStart={setIdHydStart}
//           setIdHydEnd={setIdHydEnd}
//           amontAvalResponse={amontAvalResponse}
//           selectedPk={selectedPk}
//           mode={mode}
//         />
//         <ControlComponent
//           idHydStart={idHydStart}
//           idHydEnd={idHydEnd}
//           resetSelection={resetSelection}
//           variables={variables}
//           selectedVariables={selectedVariables}
//           setSelectedVariables={setSelectedVariables}
//           selectedScenarios={selectedScenarios}
//           setSelectedScenarios={setSelectedScenarios}
//           scenarios={scenarios}
//           mode={mode}
//           setMode={setMode}
//         />
//       </ToggleContainer> */}
// export default ParentComponent;
