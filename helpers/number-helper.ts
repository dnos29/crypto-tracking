import { ICoinSnapShot, ITotalSnapShot } from "@/interfaces";

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

export const getDataSet = <T>(
  dates: string[],
  snapshots: T[],
  keyField: keyof T,
  valField: keyof T,
) => {
  if(!snapshots) return [];
  const mapSnapshots = new Map<string, number>(
    snapshots?.map(snapshot => [snapshot?.[keyField] as string, snapshot?.[valField] as number])
  );
  let i = 0;
  let dataSet = [];
  while(i < dates.length){
    dataSet.push(
      Number(mapSnapshots.get(dates?.[i]) || 0)
    );
    i++;
  }
  return dataSet;
}