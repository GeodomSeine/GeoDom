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
import { ProfileGraphDataResponse, ProgramVariable } from "../../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProfileGraphProps {
  variable: ProgramVariable; 
  data: ProfileGraphDataResponse;
  xKey: "PK" | "Strahler";
  className?: string;
}

const ProfileGraph: React.FC<ProfileGraphProps> = ({ variable, data, xKey, className = "profile_graph" }) => {
  const chartRef = useRef<any>(null);

  const xLabels = Object.keys(data).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const p5 = xLabels.map((x) => data[x]?.[`${variable.var_code.toLowerCase()}_p5`] || null);
  const p50 = xLabels.map((x) => data[x]?.[`${variable.var_code.toLowerCase()}_p50`] || null);
  const p90 = xLabels.map((x) => data[x]?.[`${variable.var_code.toLowerCase()}_p90`] || null);
  
  const chartData = {
    labels: xLabels,
    datasets: [
      {
        label: `${variable.var_code.toUpperCase()} (P5)`,
        data: p5,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(220, 220, 220, 0.7)",
        fill: +2,
      },
      {
        label: `${variable.var_code.toUpperCase()} (P50)`,
        data: p50,
        borderColor: "rgba(54, 162, 235, 1)",
      },
      {
        label: `${variable.var_code.toUpperCase()} (P90)`,
        data: p90,
        borderColor: "rgba(75, 192, 192, 1)",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: xKey,
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
    <div className={className}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default ProfileGraph;