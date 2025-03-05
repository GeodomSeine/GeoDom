// import React, { useRef, useState } from "react";
// import { Chart } from "react-chartjs-2"; // Use generic Chart component
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
//   ChartOptions,
// } from "chart.js";
// import zoomPlugin from "chartjs-plugin-zoom";
// import { BoxPlotController, BoxAndWiskers } from "@sgratzl/chartjs-chart-boxplot";
// import { DecadeScenarioValue, ProgramVariable, Scenario } from "../../services/api";
// import { getColor } from "../../utils/mapUtils";

// // Register the components including the boxplot ones
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
//   zoomPlugin,
//   BoxPlotController,
//   BoxAndWiskers
// );

// interface VariableChartProps {
//   variable: ProgramVariable;
//   decades: number[];
//   data: { p5: number[]; p50: number[]; p90: number[] };
//   className?: string | null;
//   donutsData: DecadeScenarioValue;
//   scenarioColors: Record<number, string>;
//   scenarios: Scenario[];
// }

// const VariableChart: React.FC<VariableChartProps> = ({
//   variable,
//   decades,
//   data,
//   className = "variable_element",
//   donutsData,
//   scenarioColors,
//   scenarios,
// }) => {
//   const chartRef = useRef<any>(null);
//   const [showObservations, setShowObservations] = useState(true);

//   // Build the observation (donut) datasets
//   const scenarioDatasets = Object.entries(donutsData ?? {}).flatMap(([decade, values]) =>
//     values.map(({ scenario, p5, p50, p90 }, index) => ({
//       label:
//         "Observation (" +
//         (scenarios.find((s) => s.id === scenario)?.year || "N/A") +
//         ")",
//       data: decades.map((d) => (d.toString() === decade ? p50 : null)),
//       borderColor: scenarioColors[scenario] || getColor("--basic-black"),
//       backgroundColor: scenarioColors[scenario] || getColor("--basic-grey"),
//       pointRadius: 5,
//       pointHoverRadius: 7,
//       showLine: false,
//       order: -2,
//       // Calculate boxplot data for each decade
//       boxplotData: decades.map((_, idx) => ({
//         min: data.p5[idx],
//         q1: data.p5[idx] + (data.p50[idx] - data.p5[idx]) / 2,
//         median: data.p50[idx],
//         q3: data.p50[idx] + (data.p90[idx] - data.p50[idx]) / 2,
//         max: data.p90[idx],
//       })),
//     }))
//   );

//   // Construct the chart data with both line and boxplot datasets
//   const chartData = {
//     labels: decades,
//     datasets: [
//       {
//         label: `${variable.var_code.toUpperCase()} (P5)`,
//         data: data.p5,
//         borderColor: getColor("--shade-light-grey"),
//         fill: 2,
//       },
//       {
//         label: `${variable.var_code.toUpperCase()} (P50)`,
//         data: data.p50,
//         borderColor: getColor("--secondary-blue"),
//         order: -1,
//       },
//       {
//         label: `${variable.var_code.toUpperCase()} (P90)`,
//         data: data.p90,
//         borderColor: getColor("--shade-mid-grey"),
//         order: -1,
//       },
//       {
//         type: "boxplot", // This dataset is of type boxplot
//         label: `${variable.var_code.toUpperCase()} (Boxplot P50)`,
//         data: scenarioDatasets[0]?.boxplotData,
//         backgroundColor: getColor("--secondary-blue"),
//         borderColor: getColor("--shade-mid-grey"),
//         borderWidth: 1,
//         order: -1,
//       },
//       ...(showObservations ? scenarioDatasets : []),
//     ],
//   };

//   const options: ChartOptions<"line"> = {
//     responsive: true,
//     scales: {
//       x: {
//         title: { display: true, text: "Décade" },
//       },
//       y: {
//         title: { display: true, text: variable.unit_short },
//       },
//     },
//     plugins: {
//       legend: {
//         onClick: (__, legendItem, legend) => {
//           if (legendItem.datasetIndex === -1) {
//             // Custom legend item for "Observations"
//             setShowObservations(!showObservations);
//           } else {
//             // Default behavior for other datasets
//             const chart = legend.chart;
//             const index = legendItem.datasetIndex;
//             if (index !== undefined) {
//               const meta = chart.getDatasetMeta(index);
//               meta.hidden = !meta.hidden;
//               chart.update();
//             }
//           }
//         },
//         labels: {
//           generateLabels: (chart) => {
//             const defaultLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
//             const nonObservationLabels = defaultLabels.filter(
//               (label) => !label.text.includes("Observation (")
//             );
//             if (scenarioDatasets.length > 0) {
//               nonObservationLabels.push({
//                 text: "Observations",
//                 fillStyle: getColor("--basic-grey"),
//                 strokeStyle: getColor("--basic-black"),
//                 lineWidth: 2,
//                 hidden: !showObservations,
//                 datasetIndex: -1, // custom item indicator
//                 custom: true,
//               } as any);
//             }
//             return nonObservationLabels;
//           },
//         },
//       },
//       tooltip: { enabled: true },
//     },
//   };

//   return (
//     <div className={className || ""}>
//       {/* Use the generic Chart component with a default type of "line" */}
//       <Chart ref={chartRef} type="line" data={chartData} options={options} />
//     </div>
//   );
// };

// export default VariableChart;


import React, { useRef, useState } from "react";
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
  scenarios,
}) => {
  const chartRef = useRef<any>(null);
  const [showObservations, setShowObservations] = useState(true);

  // Build donuts (observation) datasets with detailed labels (including the scenario year)
  const scenarioDatasets = Object.entries(donutsData ?? {}).flatMap(([decade, values]) =>
    values.map(({ scenario, p50 }) => ({
      label:
        "Observation (" +
        (scenarios.find(s => s.id === scenario)?.year || "N/A") +
        ")",
      data: decades.map((d) => (d.toString() === decade ? p50 : null)),
      borderColor: scenarioColors[scenario] || getColor("--basic-black"),
      backgroundColor: scenarioColors[scenario] || getColor("--basic-grey"),
      pointRadius: 5,
      pointHoverRadius: 7,
      showLine: false,
      order: -2,
    }))
  );

  // Build the chart data: include the donuts datasets only if showObservations is true.
  const chartData = {
    labels: decades,
    datasets: [
      {
        label: `${variable.var_code.toUpperCase()} (P5)`,
        data: data.p5,
        borderColor: getColor("--shade-light-grey"),
        fill: 2,
      },
      {
        label: `${variable.var_code.toUpperCase()} (P50)`,
        data: data.p50,
        borderColor: getColor("--secondary-blue"),
        order: -1,
      },
      {
        label: `${variable.var_code.toUpperCase()} (P90)`,
        data: data.p90,
        borderColor: getColor("--shade-mid-grey"),
        order: -1,
      },
      ...(showObservations ? scenarioDatasets : []),
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "Décade" },
      },
      y: {
        title: { display: true, text: variable.unit_short },
      },
    },
    plugins: {
      legend: {
        onClick: (__, legendItem, legend) => {
          if (legendItem.datasetIndex === -1) {
            // Custom legend item for "Observations" toggles the state
            setShowObservations(!showObservations);
          } else {
            // Default behavior for other datasets
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
            // Get the default legend labels
            const defaultLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
            // Filter out the individual observation labels (they include "Observation (")
            const nonObservationLabels = defaultLabels.filter(
              (label) => !label.text.includes("Observation (")
            );
            // If there are any donuts datasets, add one custom legend item to control them
            if (scenarioDatasets.length > 0) {
              nonObservationLabels.push({
                text: "Observations",
                fillStyle: getColor("--basic-grey"),
                strokeStyle: getColor("--basic-black"),
                lineWidth: 2,
                hidden: !showObservations,
                datasetIndex: -1, // custom item indicator
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
    <div className={className || ""}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default VariableChart;