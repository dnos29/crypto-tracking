import { EPercentageProfitFormula, ETransactionType, ICoin, ICoinDashboard, ITransaction } from "@/interfaces";
import { PROFIT_THRESHOLD } from "@/shared/constants";

export const sum = (items: string[]): number => {
  return items.reduce((acc: number, item: string) => Number(acc || 0) + Number(item || 0), 0);
}
export const multipe = (items: string[]): number => {
  let result = Number(items[0]);
  items.forEach((item, idx) => {
    if(idx !== 0 ){
      result = result * Number(item || 1);
    }
  })
  return result;
}

export const divide = (dividend: string | number, divisor: string | number): number => {
  if(Number(divisor) === 0){
    return 0;
  }
  return (Number(dividend) / Number(divisor));
}

export const averageCoinPrice = (coin: ICoin, transactions: ITransaction[]): ICoin => {
  const total_amount = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  const total_invested = transactions.reduce((acc, transaction) => acc + transaction.total, 0);
  return {
    ...coin,
    total_amount,
    total_invested,
    avg_price: total_invested / total_amount,
  };
}

export const initialAmountInput = (tnx_type = ETransactionType.BUY, amount = 0): string => {
  if(amount === undefined){
    return '';
  }
  if(tnx_type === ETransactionType.SELL){
    return Math.abs(amount).toString(); 
  }
  return amount.toString() || '';
}

export const sortCoinsByKey = (
  coins: ICoinDashboard[],
  sortBy: {[key: string]: 'asc' | 'desc'}): ICoinDashboard[] => {
  if (sortBy?.name) {
    return coins?.sort((item1, item2) => {
      if (sortBy?.name === "asc") {
        return item1.name.localeCompare(item2.name);
      } else {
        return item2.name.localeCompare(item1.name);
      }
    }) || [];
  }
  
  if (
    sortBy?.profit ||
    sortBy?.profitPercentage ||
    sortBy?.total_invested || 
    sortBy?.estVal
  ) {
    const key = Object.keys(sortBy)[0] as keyof ICoinDashboard;
    return coins?.sort((item1, item2) => {
      if (sortBy?.[key] === "asc") {
        return Number(item1?.[key]) - Number(item2?.[key]);
      } else {
        return Number(item2?.[key]) - Number(item1?.[key]);
      }
    }) || [];
  }

  if (sortBy?.profitToIcon && sortBy?.profitToIcon === "asc") {
    return coins.filter((item) => item.profitToIcon !== "") || []; 
  }

  return coins;
}

export const percentageProfit = (
  percentageProfitFormula = EPercentageProfitFormula.NORMAL,
  total_invested: number,
  estVal: number
) => {
  // console.log('percentageProfitFormula', percentageProfitFormula);
  // Floating
  if(total_invested <= PROFIT_THRESHOLD){
    return 0;
  }
  // loss
  if(total_invested > estVal && percentageProfitFormula === EPercentageProfitFormula.VEBO){
    return (1 - total_invested / estVal) * 100;
  }
  // default
  return (estVal - total_invested) / total_invested * 100;
}