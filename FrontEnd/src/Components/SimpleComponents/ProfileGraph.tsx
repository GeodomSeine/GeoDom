import React, {useState } from "react";
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
  LegendItem,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { DonutsDataResponse, ProfileGraphDataResponse, ProgramVariable, Scenario } from "../../services/api";
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

interface ProfileGraphProps {
  variable: ProgramVariable; 
  data: ProfileGraphDataResponse;
  xKey: "PK" | "Strahler";
  className?: string;
  donutsData: DonutsDataResponse;
  scenarioColors: Record<number, string>;
  scenarios: Scenario[];
  decades: [number, number];
  profilLongs: React.RefObject<any>;
}
const ProfileGraph: React.FC<ProfileGraphProps> = ({
  variable,
  data,
  xKey,
  className = "profile_graph",
  donutsData,
  scenarioColors,
  scenarios,
  decades,
  profilLongs
}) => {
  const [showObservations, setShowObservations] = useState(true);

  // Prepare x-axis labels
  let xLabels = Object.keys(data);
  if (xKey === "PK") {
    xLabels.sort((a, b) => {
      const [_, ordA, pkA] = a.split('_').map(Number);
      const [__, ordB, pkB] = b.split('_').map(Number);
      return ordA - ordB || pkA - pkB;
    });
  } else {
    xLabels.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }
  const xDisplayLabels = xLabels.map((_, index) => index + 1);

  const p5 = xLabels.map((x) => data[x]?.[`${variable.var_code.toLowerCase()}_p5`] || null);
  const p50 = xLabels.map((x) => data[x]?.[`${variable.var_code.toLowerCase()}_p50`] || null);
  const p90 = xLabels.map((x) => data[x]?.[`${variable.var_code.toLowerCase()}_p90`] || null);
  
  const donutsDatasets: Array<{
    label: string;
    data: (number | null)[];
    borderColor: string;
    backgroundColor: string;
    pointStyle: "circle";
    pointRadius: number;
    pointBackgroundColor: string;
    order: number;
  }> = [];  
  
  Object.keys(donutsData ?? {}).forEach((x) => {
    const variableData = donutsData[x]?.[variable.var_code.toLowerCase()];
    if (!variableData) return;

    Object.keys(variableData ?? {}).forEach((decade) => {
      const decadeNumber = parseInt(decade, 10);
      if (decadeNumber < decades[0] || decadeNumber > decades[1]) return;

      variableData[decade].forEach(({ scenario, value }) => {
        donutsDatasets.push({
          label: `Observation (Scenario ${scenarios.find(s => s.id === scenario)?.year}, Décade ${decade})`,
          data: xLabels.map((label) => (label === x ? value : null)),
          borderColor: scenarioColors[scenario] || getColor("--success-color"),
          backgroundColor: scenarioColors[scenario] || getColor("--success-light"),
          pointStyle: "circle",
          pointRadius: 4,
          pointBackgroundColor: scenarioColors[scenario] || getColor("--success-color"),
          order: 0,
        });
      });
    });
  });

  const chartData = {
    labels: xDisplayLabels,
    datasets: [
      {
        label: `${variable.var_code.toUpperCase()} (P5)`,
        data: p5,
        borderColor: getColor("--danger-color"),
        backgroundColor: getColor("--basic-grey"),
        fill: 2,
      },
      {
        label: `${variable.var_code.toUpperCase()} (P50)`,
        data: p50,
        borderColor: getColor("--warning-color"),
        order: -1,
      },
      {
        label: `${variable.var_code.toUpperCase()} (P90)`,
        data: p90,
        borderColor: getColor("--secondary-blue"),
        order: -1,
      },
      ...(showObservations ? donutsDatasets.map((dataset) => ({ ...dataset, order: -2 })) : []),
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: xKey },
      },
      y: {
        title: { display: true, text: variable.unit_short },
      },
    },
    plugins: {
      legend: {
        onClick: (__, legendItem, legend) => {
          if (legendItem.datasetIndex === -1) {
            setShowObservations(!showObservations);
          } else {
            const chart = legend.chart;
            const index = legendItem.datasetIndex;
            if (index !== undefined) {
              const meta = chart.getDatasetMeta(index);
              meta.hidden = !meta.hidden;
              chart.update();
            }
          }
        },
        labels: {
          generateLabels: (chart) => {
            const defaultLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
            const nonObservationLabels = defaultLabels.filter(
              (label) => !label.text.includes("Observation (")
            );
            if (donutsDatasets.length > 0) {
              nonObservationLabels.push({
                text: "Observations",
                fillStyle: getColor("--shade-light-grey"),
                strokeStyle: getColor("--basic-black"),
                lineWidth: 2,
                hidden: !showObservations,
                datasetIndex: -1, 
                custom: true,
              } as any as LegendItem);
            }
            return nonObservationLabels;
          },
        },
      },
      tooltip: { enabled: true },
    },
  };

  return (
    <div ref={profilLongs} className={className}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ProfileGraph;
