import { EPlatform, ICoinDashboard } from "@/interfaces";

export const padStartStr = (str: string | number, maxLength = 2, fillString = '0') => {
  return str.toString().padStart(maxLength, fillString);
}

export const convertStrToPlatFrom = (str: string): EPlatform => {
  switch(str.toLocaleLowerCase()){
    case EPlatform.Binance:
      return EPlatform.Binance;
    case EPlatform.Mexc:
      return EPlatform.Mexc;
    default: 
      return EPlatform.Okx;
  }
}

export const profitToTextColor = (profit: number) => {
  if(profit > 0){
    return 'text-teal-500';
  }else if(profit < 0){
    return 'text-red-500';
  }
  return '';
}

const enum ECompareSybol {
  gt = 'gt',
  gte = 'gte',
  lt = 'lt',
  lte = 'lte',
  e = 'e',
}
export const profitToIcon = (noti_sell: string, coin: ICoinDashboard): string => {
  if(coin?.total_invested < 1){
    return '';
  }
  const conditions = noti_sell.split(',').filter(condition => (!!condition));  
  // console.log(conditions);
  const checkResult: boolean[] = conditions.map((condition: string) => (checkByCondition(condition, coin))); 
  if(checkResult.length && checkResult.some((check) => (check))){
    return '🔥';
  }
  return '';
}

export const checkByCondition = (condition: string, coin: ICoinDashboard): boolean => {
  const [comparisonKey , comparison, comparisonVal]= [...condition.split('|')];
  if(!Object.keys(coin).includes(comparisonKey)){
    return false;
  }
  if(!!comparisonKey && !!comparison && !!comparisonVal){
    const key = comparisonKey as keyof ICoinDashboard;
    // console.log(comparisonKey, comparison, comparisonVal, coin?.[key]);
    try {
      switch (comparison) {
        case ECompareSybol.gt:
          return Number(coin?.[key]) > Number(comparisonVal);
        case ECompareSybol.gte:
          return Number(coin?.[key]) >= Number(comparisonVal);
        case ECompareSybol.gte:
          return Number(coin?.[key]) === Number(comparisonVal);
        case ECompareSybol.lt:
          return Number(coin?.[key]) < Number(comparisonVal);
        case ECompareSybol.lte:
          return Number(coin?.[key]) <= Number(comparisonVal);
        default:
          return false;
      }
    } catch (error) {
      return false; 
    }
  }
  return false;
}

export const convertToCmcLink = (cmc_name: string) => {
  const cmcNameSlug = String(cmc_name)
    .toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll(/[\(|\)]/g, '')
    .replaceAll('.', '-');
  return `https://coinmarketcap.com/currencies/${cmcNameSlug}`;
}

export const platformLink = (cmc_symbol: string, platform: EPlatform) => {
  if(platform?.includes(EPlatform.Okx)){
    return `https://www.okx.com/trade-spot/${cmc_symbol.toLowerCase()}-usdt`;
  }else if(platform?.includes(EPlatform.Mexc)) {
    return `https://www.mexc.com/exchange/${cmc_symbol.toUpperCase()}_USDT`;
  } else {
    return `https://www.binance.com/en/trade/${cmc_symbol.toUpperCase()}_USDT?type=spot`;
  }
}