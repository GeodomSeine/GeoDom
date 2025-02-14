import React from "react";
import VariableChart from "../SimpleComponents/VariableChart";
import ToggleComponent from "../Visulisation/ToggleComponent";
import SliderComponent from "../SimpleComponents/SliderComponent";
import "./Espace2Component.scss";

interface Esapce2ComponentProps {
  sliderChange: (value: number) => void;
  min :number;
  max :number;
  data: Array<{
    decade: number;
    [variable: string]: number;
  }>;
  mode: "complet" | "amont-aval";
}

const Esapce2Component: React.FC<Esapce2ComponentProps> = ({
  sliderChange,
  data,
  min, 
  max,
  mode,
}) => {
  const decades = data.map((entry) => entry.decade);

  const variables = Object.keys(data[0] || {}).filter(
    (key) => key !== "decade"
  );

  const groupedData: Record<
    string,
    { p5: number[]; p50: number[]; p90: number[] }
  > = {};

  variables.forEach((variableKey) => {
    const [baseVariable] = variableKey.split("_");
    if (!groupedData[baseVariable]) {
      groupedData[baseVariable] = { p5: [], p50: [], p90: [] };
    }
    data.forEach((entry) => {
      if (variableKey.endsWith("_p5"))
        groupedData[baseVariable].p5.push(entry[variableKey]);
      if (variableKey.endsWith("_p50"))
        groupedData[baseVariable].p50.push(entry[variableKey]);
      if (variableKey.endsWith("_p90"))
        groupedData[baseVariable].p90.push(entry[variableKey]);
    });
  });

  return (
    <div className='space2'>
      <ToggleComponent title="Visualisation Graphes">
      <SliderComponent min={min} max={max} step={1} onChange={sliderChange} leftLabel={mode == "amont-aval" ? "Pk min" : "Strahler min"} rightLabel={mode == "amont-aval" ? "Pk max" : "Strahler max"}/>
        <div className="chart_container">
          {Object.entries(groupedData).map(([variable, chartData], index) => (
            <VariableChart
              key={variable}
              className={`variable-chart chart-${index}`} 
              variable={variable}
              decades={decades}
              data={chartData}
            />
          ))}
        </div>
      </ToggleComponent>
    </div>
  );
};

export default Esapce2Component;
