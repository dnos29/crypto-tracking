export enum ETransactionType {
  BUY = 'buy',
  SELL = 'sell',
}
export interface ITransaction {
  id?: number,
  tnx_date: string,
  type: ETransactionType,
  amount: number,
  price_at: number,
  total: number,
  platform: EPlatform,
  coin: number,
  userId: string,
}

export interface ICoin {
  id?: number,
  name: string,
  code: string,
  total_amount: number,
  avg_price: number,
  total_invested: number,
  userId: string,
}

export enum EPlatform {
  Binance = 'binance',
  Okx = 'okx',
  Mexc = 'mexc',
}

export const TPlatformColor = {
  [EPlatform.Binance]: 'bg-yellow-500',
  [EPlatform.Okx]: 'bg-slate-500',
  [EPlatform.Mexc]: 'bg-blue-500',
}