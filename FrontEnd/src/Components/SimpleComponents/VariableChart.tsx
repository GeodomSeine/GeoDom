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
import { ProgramVariable } from "../../services/api";
import { getColor } from "../../utils/mapUtils";

// import ButtonComponent from "./ButtonComponent";

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
  variable: ProgramVariable; // Nom de la variable (e.g., no3, oxy)
  decades: number[]; // Décennies
  data: { p5: number[]; p50: number[]; p90: number[] }; // Données pour p5, p50, p90
  className?:string | null;
}

const VariableChart: React.FC<VariableChartProps> = ({ variable, decades, data, className = "variable_element" }) => {
  const chartRef = useRef<any>(null);

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
  };

  return (
    <div className={`${className}`}>
      <Line ref={chartRef} data={chartData} options={options}/>
    </div>
  );
};

export default VariableChart;