import React, { useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { DecadeScenarioValue, ProgramVariable, Scenario } from "../../services/api";
import { getColor } from "../../utils/mapUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

interface VariableChartProps {
  variable: ProgramVariable;
  decades: number[];
  data: { p5: number[]; p50: number[]; p90: number[] };
  className?: string | null;
  donutsData: DecadeScenarioValue;
  scenarioColors: Record<number, string>;
  scenarios: Scenario[];
}

const VariableChart: React.FC<VariableChartProps> = ({ 
  variable, 
  decades, 
  data, 
  className = "variable_element", 
  donutsData, 
  scenarioColors, 
  scenarios
}) => {
  const chartRef = useRef<any>(null);

  // Générer les datasets des scénarios dans donutsData
  const scenarioDatasets = Object.entries(donutsData ?? {}).flatMap(([decade, values]) => {
    return values.map(({ scenario, value }) => ({
      label : "Observation (" + scenarios.find(s => s.id === scenario)?.year + ")",
      data: decades.map((d) => (d.toString() === decade ? value : null)), 
      borderColor: scenarioColors[scenario] || getColor("--basic-black"), 
      backgroundColor: scenarioColors[scenario] || getColor("--basic-grey"), 
      pointRadius: 5, 
      pointHoverRadius: 7,
      showLine: false,
    }));
  });  

  const chartData = {
    labels: decades,
    datasets: [
      {
        label: `${variable.var_code.toUpperCase()} (P5)`,
        data: data.p5,
        borderColor: getColor("--danger-color"),
        backgroundColor: getColor("--basic-grey"),
        fill: +2,
      },
      {
        label: `${variable.var_code.toUpperCase()} (P50)`,
        data: data.p50,
        borderColor: getColor("--warning-color"),
        order:-1,
      },
      {
        label: `${variable.var_code.toUpperCase()} (P90)`,
        data: data.p90,
        borderColor: getColor("--secondary-blue"),
        order:-1,
      },
      ...scenarioDatasets, // Ajout des datasets des scénarios
    ],
  };

  

  const options: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Décade",
        },
      },
      y: {
        title: {
          display: true,
          text: variable.unit_short,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
            filter: function(item, __) {
                return !item.text.includes('Observation');
            }
        }
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className={`${className}`}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default VariableChart;
