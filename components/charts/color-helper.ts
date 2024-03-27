import { IDataSet } from "@/interfaces";
import { presetColors } from "./constants";

export const colorDataset = (datasets: IDataSet[]) => {
  return datasets.map((dataset, i) => ({
    ...dataset,
    yAxisID: dataset?.yAxisID || 'y',
    backgroundColor: presetColors?.[i]?.backgroundColor,
    borderColor: presetColors?.[i]?.borderColor,
  }))
}