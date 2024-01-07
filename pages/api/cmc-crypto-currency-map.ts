import type { NextApiRequest, NextApiResponse } from 'next'
import CmcCryptoCurrencyMap from '../../cmc-data/cmc-cryptocurrency-map.json';

type ResponseData = string[];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const symbolSearch = (req.query.coinName as string).split('_')[0];
  const data =  CmcCryptoCurrencyMap?.data ||  [];
  const cmc_names = data
    .filter(item => item.symbol.toLowerCase().includes(symbolSearch.toLowerCase()))
    .map(item => item.name);
  res.status(200).json(cmc_names);
}