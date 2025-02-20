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
import { DecadeScenarioValue, ProgramVariable } from "../../services/api";

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
}

const VariableChart: React.FC<VariableChartProps> = ({ 
  variable, 
  decades, 
  data, 
  className = "variable_element", 
  donutsData, 
  scenarioColors 
}) => {
  const chartRef = useRef<any>(null);

  // Générer les datasets des scénarios dans donutsData
  const scenarioDatasets = Object.entries(donutsData ?? {}).flatMap(([decade, values]) => {
    return values.map(({ scenario, value }) => ({
      label : "donuts",
      data: decades.map((d) => (d.toString() === decade ? value : null)), 
      borderColor: scenarioColors[scenario] || "rgba(0, 0, 0, 1)", 
      backgroundColor: scenarioColors[scenario] || "rgba(0, 0, 0, 0.2)", 
      pointRadius: 5, 
      pointHoverRadius: 7,
      showLine: false, // Ne pas dessiner de ligne entre les points
    }));
  });  

  // Données pour le graphique
  const chartData = {
    labels: decades,
    datasets: [
      {
        label: `${variable.var_code.toUpperCase()} (P5)`,
        data: data.p5,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(220, 220, 220, 0.7)",
        fill: +2,
      },
      {
        label: `${variable.var_code.toUpperCase()} (P50)`,
        data: data.p50,
        borderColor: "rgba(54, 162, 235, 1)",
      },
      {
        label: `${variable.var_code.toUpperCase()} (P90)`,
        data: data.p90,
        borderColor: "rgba(75, 192, 192, 1)",
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
                return !item.text.includes('donuts');
            }
        }
      },
      tooltip: {
        enabled: true,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "xy",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
        },
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
