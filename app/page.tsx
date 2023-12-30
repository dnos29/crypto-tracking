import { headers } from '@/helpers/header-helper';
import { formatNumber } from '@/helpers/number-helper';
import supabase from '@/utils/supabase';
import { currentUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link';

export default async function Home() {
  const user = await currentUser();
  const {data: coins} = await supabase.from('coins').select().eq('userId', user?.id);
  const allSymbols = coins?.map((coin) => (coin?.code.toUpperCase()));
  const {data: marketQuote} = await fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${allSymbols?.join(',')}&convert=USD`, {
    mode: 'cors',
    headers,
  }).then((res) => res.json());
  const items = coins?.map((coin) => {
    const marketPrice = marketQuote?.[coin.code.toUpperCase()]?.[0]?.quote?.USD?.price;
    const estVal = marketPrice * (coin.total_amount || 0);
    return {
      ...coin,
      marketPrice,
      avg_price: coin.total_invested < 1 ? 0 : coin.avg_price,
      estVal: marketPrice * (coin.total_amount || 0),
      isProfit: coin.avg_price < marketPrice,
      profit: estVal - coin.total_invested,
      profitPercentage: (estVal - coin.total_invested) / coin.total_invested * 100 || 0,
    };
  });
  const totalEstVal = items?.reduce((acc, coin) => acc + coin.estVal, 0);
  return (
    <div className='mt-4'>
      Hi there!
      <p className='text-xs	mt-4'>
        Est total value
      </p>
      <p className=''>
        <span className='text-2xl font-bold'>{formatNumber(totalEstVal, 2)}</span><sup> USDT</sup>
      </p>
      <div className='mt-2'>
        <p className=''>Assets</p>
        <div className="list">
          <div className='w-full'>
            <div className="flex text-xs text-gray-400">
              <div className='w-32'>Name</div>
              <div className='w-1/2 text-right'>Avg/Market price</div>
              <div className='w-1/2 text-right'>Total invested/Est val</div>
            </div>
            {
              items?.map((coin) => (
                <Link key={coin.id} href={`/crypto/${coin.code}`}>
                  <div  className="flex text-sm my-2 rounded bg-gray-50 px-2 py-1">
                    <div className='w-32 grid items-center'><div>{coin.name} - {coin.total_amount || 0}</div></div>
                    <div className='w-1/2 text-right'>
                        <p>{formatNumber(coin.avg_price) || '-'}</p>
                        <p>{formatNumber(coin.marketPrice)}</p>
                    </div>
                    <div className='w-1/2 text-right'>
                        <p>{formatNumber(coin.total_invested, 2) || 0} / {formatNumber(coin.estVal, 2)}</p>
                        <p className={coin.isProfit ? `text-teal-500` : 'text-red-500'}>
                          {formatNumber(coin.profit, 2)} / {formatNumber(coin.profitPercentage, 2)}%</p>
                    </div>
                  </div>
                </Link>
              ))
            }
          </div>
        </div>
      </div>
    </div> 
  )
}
