import { ITotalSnapShot } from "@/interfaces";

export function formatNumber(num: number, defaulDigits = 6){
  let digits = defaulDigits;
  if(num < 1 && num > 0){
    const fixNumberStr =  Number(num).toString();
    const firstDigit = fixNumberStr.search(/[1-9]/g);
    if(firstDigit >= defaulDigits + 1){
      digits = defaulDigits + 2;
    }
  }
  const fixedNumber = Number(num).toFixed(digits);
  return new Intl.NumberFormat('en-US', {maximumFractionDigits: digits}).format(Number(fixedNumber));
}

export const getDataSet = (dates: string[], snapshots: ITotalSnapShot[], field: keyof ITotalSnapShot) => {
  if(!snapshots) return [];
  const mapSnapshots = new Map(snapshots?.map(snapshot => [snapshot.snapshot_date, snapshot?.[field]]));
  let i = 0;
  let dataSet = [];
  while(i < dates.length){
    dataSet.push(
      Number(mapSnapshots.get(dates[i]) || 0)
    );
    i++;
  }
  return dataSet;
}