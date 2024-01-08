import type { NextApiRequest, NextApiResponse } from 'next'
import CmcCryptoCurrencyMap from '../../cmc-data/cmc-cryptocurrency-map.json';
import { ICmcMap } from '@/interfaces';

type ResponseData = ICmcMap[];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const symbolSearch = (req.query.coinName as string).split('_')[0];
  const data =  CmcCryptoCurrencyMap?.data ||  [];
  const cmc_map: ICmcMap[] = data.filter(item => item.symbol.toLowerCase() === symbolSearch.toLowerCase());
  res.status(200).json(cmc_map);
}
