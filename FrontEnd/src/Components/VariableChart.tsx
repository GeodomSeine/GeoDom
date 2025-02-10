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
import ButtonComponent from "./ButtonComponent/ButtonComponent";

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
  variable: string; // Nom de la variable (e.g., no3, oxy)
  decades: number[]; // Décennies
  data: { p5: number[]; p50: number[]; p90: number[] }; // Données pour p5, p50, p90
  className?:string | null;
}

const VariableChart: React.FC<VariableChartProps> = ({ variable, decades, data, className = "variable_chart" }) => {
  const chartRef = useRef<any>(null);

  const chartData = {
    labels: decades,
    datasets: [
      {
        label: `${variable} (P5)`,
        data: data.p5,
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
      {
        label: `${variable} (P50)`,
        data: data.p50,
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
      },
      {
        label: `${variable} (P90)`,
        data: data.p90,
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
      },
    ],
  };

  const options : ChartOptions<"line"> = {
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          //mode: 'xy',
        },
        limits: {
          x: { min: 0, max: decades.length - 1 }, // Limite pour les labels
          y: { min: Math.min(...data.p5), max: Math.max(...data.p90) }, // Limites dynamiques selon les données
        },
      },
    },
  };
  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div className={`${className}`}>
      <div>
        <h3>{`Graph for ${variable}`}</h3>
        <ButtonComponent txt={"Reset Zoom"} onClick={resetZoom}></ButtonComponent>
      </div>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default VariableChart;