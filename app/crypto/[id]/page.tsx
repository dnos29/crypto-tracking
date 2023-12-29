import { formatDate } from "@/helpers/time-helper";
import supabase from "@/utils/supabase"
import { currentUser } from '@clerk/nextjs'
import Link from "next/link";
export const revalidate = 0

const enum ETransactionType {
  BUY = 'buy',
  SELL = 'sell',
}
export interface ITransaction {
  id:number,
  tnx_date: string,
  type: ETransactionType,
  amount: number,
  price_at: number,
  total: number,
  platform: EPlatform,
}

export interface ICoin {
  name: string,
  code: string,
  total_amount: number,
  avg_price: number,
  total_invested: number,
}

const enum EPlatform {
  Binance = 'binance',
  Okx = 'okx',
  Mexc = 'mexc',
}

const TPlatformColor = {
  [EPlatform.Binance]: 'bg-yellow-500',
  [EPlatform.Okx]: 'bg-slate-500',
  [EPlatform.Mexc]: 'bg-blue-500',
}
const headers = new Headers({
  'X-CMC_PRO_API_KEY': process.env.NEXT_PUBLIC_CMC_KEY || '',
});

export default async function Page({params}: {params: {id: string}}){
  const user = await currentUser();
  const {data: coin} = await supabase.from('coins').select().eq('userId', user?.id).eq('code', params.id?.toUpperCase()).limit(1).single();
  const {data: transactions} = await supabase.from('transactions').select().eq('userId', user?.id).eq('coin', coin?.id);
  const totalAmount = transactions?.reduce((accumulator, tnx: ITransaction) => accumulator + tnx.amount, 0);
  const totalInvested = transactions?.reduce((accumulator, tnx: ITransaction) => accumulator + tnx.total, 0);
  const isThaTroi = totalInvested < 1;
  const avgPrice = isThaTroi ? 'Thả trôi' : totalInvested / totalAmount;
  const marketInfo = await fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${params.id.toUpperCase()}&convert=USD`, {
    mode: 'cors',
    headers,
  }).then((res) => res.json());
  const marketPrice = marketInfo?.data?.[params.id.toUpperCase()]?.[0]?.quote?.USD?.price;
  return (
    <> 
      <div className="grid grid-row-3 grid-flow-col gap-2">
        <div className="w-14 text-left">
          <Link href={'/'}>
            <button className="text-sm text-gray-400">&#9664; Back</button>
          </Link>
        </div>
        <p className="text-center uppercase"> {totalAmount} {params.id}</p>
        <div className="w-14"></div>
      </div>
      <div className='w-full'>
        <div className="flex p-2 gap-2">
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Market price</h2>
            <p>{marketPrice}</p>
          </div>
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Total invested</h2>
            <p>{isThaTroi ? 0 : totalAmount}</p>
          </div>
        </div>
        <div className="flex p-2 gap-2">
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Est val</h2>
            <p> <span>{totalAmount * marketPrice}</span></p>
          </div>
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Avg price</h2>
            <p>{isThaTroi ? 0 : avgPrice}</p>
          </div>
        </div>
      </div>
      {/* <p className='text-xs	mt-4'>
        Est total value
      </p> */}
      <div className="flex justify-between">
        {/* <p className='text-2xl font-bold'>
          <span className=''>{coin.name}</span><span className="ml-2 uppercase">{params.id}</span> - <span>{coin.total_amount}</span><span className="ml-2">USDT</span>
        </p> */}
        <button className="bg-black text-white text-xs rounded p-1">New tnx</button>
      </div>
      <div className='mt-2'>
        <p className=''>History</p>
      </div>
      <div className="list">
          <div className='w-full'>
            <div className="flex text-xs text-gray-400 p-2">
              <div className='w-32'>Date</div>
              <div className='w-10'><span className="text-teal-500">Buy</span>/<span className="text-red-500">Sell</span></div>
              <div className='w-1/3 text-right'>Amount</div>
              <div className='w-1/3 text-right'>Price</div>
              <div className='w-20 text-right'>Platform</div>
            </div>
            {
              transactions?.map((tnx: ITransaction) => 
                (
                  <div key={tnx.id} className={`flex items-center text-sm mb-2 p-2 rounded ${tnx.type === ETransactionType.SELL ? 'bg-pink-100' : 'bg-teal-50'}`}>
                    <div className='w-32'>{formatDate(tnx.tnx_date)}</div>
                    <div className={`w-10 capitalize ${tnx.type === ETransactionType.BUY ? 'text-teal-500' : 'text-red-500'}`}>{tnx.type}</div>
                    <div className='w-1/3 text-right'>{tnx.amount}</div>
                    <div className='w-1/3 text-right'>{tnx.price_at}</div>
                    <div className='w-20 text-right'>
                      <span className={`capitalize text-white rounded p-1 ${TPlatformColor[tnx.platform]}`}>{tnx.platform.charAt(0)}</span>
                    </div>
                  </div>
                )
              )
            }
          </div>
        </div>
    </>
  )
}