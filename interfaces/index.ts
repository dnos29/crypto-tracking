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
  coin: number,//TODO remove
  cmc_id: number,
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
  total_invested: string,
  total_amount: string,
}
export interface ICoin {
  id?: number,
  name: string,
  cmc_id: number,
  cmc_name: string,
  cmc_slug: string,
  cmc_symbol: string,
  total_amount: number,
  avg_price: number,
  total_invested: number,
  userid: string,
}

export interface ICoinDashboard extends ICoin {
  marketPrice: number,
  avg_price: number,
  estVal: number,
  isProfit: boolean,
  profit: number,
  profitPercentage: number,
  profitToIcon?: string,
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

export interface IValidationResult{
  [key: number]: {
    errors: any;
  }
}

export enum EValidateCsvType{
  Transaction,
  Coin
}

export interface ICmcMap {
  id: number
  rank: number
  name: string
  symbol: string
  slug: string
  is_active: number
  first_historical_data: string
  last_historical_data: string
  platform: any
}