
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
import { options } from "./constants";
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
        options={options}
        data={{
          labels,
          datasets: colorDataset(datasets),
        }}
      />
    </div>
  )
};
