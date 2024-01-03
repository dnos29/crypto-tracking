import { EPlatform } from "@/interfaces";

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