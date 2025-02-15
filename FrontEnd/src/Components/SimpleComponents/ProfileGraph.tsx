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
import { ProfileGraphDataResponse } from "../../services/api";

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
  variable: string; 
  data: ProfileGraphDataResponse;
  xKey: "PK" | "Strahler";
  className?: string;
}

const ProfileGraph: React.FC<ProfileGraphProps> = ({ variable, data, xKey, className = "profile_graph" }) => {
  const chartRef = useRef<any>(null);

  const xLabels = Object.keys(data).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const p5 = xLabels.map((x) => data[x]?.[`${variable}_p5`] || null);
  const p50 = xLabels.map((x) => data[x]?.[`${variable}_p50`] || null);
  const p90 = xLabels.map((x) => data[x]?.[`${variable}_p90`] || null);
  
  const chartData = {
    labels: xLabels,
    datasets: [
      {
        label: `${variable} (P5)`,
        data: p5,
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
      {
        label: `${variable} (P50)`,
        data: p50,
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
      },
      {
        label: `${variable} (P90)`,
        data: p90,
        borderColor: "rgba(75, 192, 192, 1)",
        fill: false,
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
          text: variable,
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