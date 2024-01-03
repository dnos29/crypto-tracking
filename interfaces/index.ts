export enum ETransactionType {
  BUY = 'buy',
  SELL = 'sell',
  HOLDING = 'holding',
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
  userid: string,
}
export interface ITransactionCsv {
  coin: string,
  type: string,
  platform: string,
  tnx_date: string,
  amount: string,
  price_at: string,
}

export interface ICoinCsv {
  name: string,
  code: string,
}
export interface ICoin {
  id?: number,
  name: string,
  code: string,
  total_amount: number,
  avg_price: number,
  total_invested: number,
  userid: string,
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