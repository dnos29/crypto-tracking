
"use client";

import { IDataSet } from "@/interfaces";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  PointElement,
  LineElement,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { colorDataset } from "./color-helper";

// Register ChartJS components using ChartJS.register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface ILineChartProps {
  labels?: string[],
  datasets?: IDataSet[],
}
export const LineChart = (props: ILineChartProps) => {
  const { labels } = props;
  const datasets = props.datasets;
  if(!labels?.length || !datasets?.length){
    return (<>Invalid data</>);
  }
  return (
    <div>
      <Line
        data={{
          labels,
          datasets: colorDataset(datasets),
        }}
        options={
          {
            responsive: true,
            interaction: {
              intersect: false,
              mode: 'index',
            },
            scales: {
              y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
              },
              y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
            plugins: {
              legend: {
                position: 'bottom' as const,
              },
              title: {
                display: false,
                text: 'Line Chart',
              },
              tooltip: {
                intersect: false
              },
            },
          }
        }
      />
    </div>
  )
};