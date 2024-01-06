import { EPlatform, EValidateCsvType, IValidationResult } from "@/interfaces";
import { ETransactionType } from "@/interfaces";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, Length, validate, validateOrReject } from "class-validator";
import { number } from "zod";

class TransactionCsv{
  @IsNotEmpty()
  coin: string;

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
    this.coin = params?.coin?.toUpperCase();
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
  code?: string;

  @IsOptional()
  @IsNumberString()
  total_invested: string;

  @IsOptional()
  @IsNumberString()
  total_amount: string;

  constructor(params?: any){
    this.name = params?.name?.toUpperCase();
    this.code = params?.code?.toUpperCase();
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