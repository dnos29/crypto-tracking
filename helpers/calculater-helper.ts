import { ETransactionType, ICoin, ITransaction } from "@/interfaces";

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