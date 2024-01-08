import { EPlatform, EValidateCsvType, IValidationResult } from "@/interfaces";
import { ETransactionType, ICmcMap } from "@/interfaces";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Length, validate, validateOrReject } from "class-validator";
import CmcCryptoCurrencyMap from '../cmc-data/cmc-cryptocurrency-map.json';

class TransactionCsv{
  @IsNotEmpty()
  coin_name: string;

  @IsNotEmpty()
  @IsNumber()
  cmc_id: number;

  @IsNotEmpty()
  cmc_name: string;

  @IsOptional()
  @IsNotEmpty()
  cmc_slug: string;

  @IsNotEmpty()
  cmc_symbol: string;

  @IsOptional()
  @IsEnum(ETransactionType)
  // default is hoilding
  type?: string;

  @IsOptional()
  @IsEnum(EPlatform)
  platform?: string;

  @IsOptional()
  @IsDateString()
  tnx_date?: string;

  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsNotEmpty()
  @IsNumberString()
  total: string;

  constructor(params?: any){
    this.coin_name = params?.coin_name?.toUpperCase();
    this.cmc_id = Number(params?.cmc_id);
    this.cmc_name = params?.cmc_name;
    this.cmc_slug = params?.cmc_slug;
    this.cmc_symbol = params?.cmc_symbol;
    this.type = params?.type?.toLocaleLowerCase();
    this.platform = params?.platform.toLocaleLowerCase();
    this.tnx_date = params?.tnx_date;
    this.amount = params?.amount;
    this.total = params?.total;
  }
}

class CoinCsv{
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  cmc_id: number;

  @IsNotEmpty()
  cmc_name: string;

  @IsOptional()
  @IsNotEmpty()
  cmc_slug: string;

  @IsNotEmpty()
  cmc_symbol: string;

  @IsOptional()
  @IsNumberString()
  total_invested: string;

  @IsOptional()
  @IsNumberString()
  total_amount: string;

  constructor(params?: any){
    this.name = params?.name?.toUpperCase();
    this.cmc_id = Number(params?.cmc_id);
    this.cmc_name = params?.cmc_name;
    this.cmc_slug = params?.cmc_slug;
    this.cmc_symbol = params?.cmc_symbol;
    this.total_invested = params?.total_invested || '0';
    this.total_amount = params?.total_amount || '0';
  }
}

export const csvValidator = async (items: any[], type = EValidateCsvType.Coin): Promise<IValidationResult> => {
  const validateResults: IValidationResult = {};
  let idx = 0;
  for (const item of items) {
    idx++;
    let itemCsv;
    if(type === EValidateCsvType.Transaction){
      itemCsv = new TransactionCsv(item);
    }else{
      itemCsv = new CoinCsv(item);
    }
    try {
      await validateOrReject(itemCsv);
    } catch (errors) {
      console.log('transaction-item: ', idx, 'errors', errors);   
      validateResults[idx] = {errors};
    }
  }
  console.log('validateResults.idxs', Object.keys(validateResults));
  return validateResults;
}

export const findCmcMap = (cmc_id: string|number) => {
  const data: ICmcMap[] = CmcCryptoCurrencyMap?.data || [];
  const cmc_map = data.find(item => item.id === Number(cmc_id || 0));
  return {
    cmc_id: cmc_map?.id,
    cmc_name: cmc_map?.name,
    cmc_slug: cmc_map?.slug,
    cmc_symbol: cmc_map?.symbol,
  };
}