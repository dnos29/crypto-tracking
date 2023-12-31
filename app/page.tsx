import { headers } from '@/helpers/header-helper';
import { formatNumber } from '@/helpers/number-helper';
import supabase from '@/utils/supabase';
import { currentUser } from '@clerk/nextjs'
import Link from 'next/link';
import { CoinModal } from '@/components/coins/coin-modal';
import { CoinDeleteModal } from '@/components/coins/delete-modal';

export default async function Home() {
  const user = await currentUser();
  const { data: coins } = await supabase.from('coins').select().eq('userId', user?.id);
  const allSymbols = coins?.map((coin) => (coin?.code.toUpperCase()));
  const { data: marketQuote } = await fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${allSymbols?.join(',')}&convert=USD`, {
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
        <p className=''>Assets <span className=''><CoinModal userId={user?.id || ''} /></span></p>
        <div className="list">
          <div className='w-full'>
            {
              items?.map((coin) => (
                <div key={coin.id} className="border-b-2 border-slate-100 mt-2">
                  <div className="flex justify-between">
                    <div className='text-sm w-32 grid items-center'><div>{coin.name} - {coin.total_amount || 0}</div></div>
                  </div>
                  <div className="flex text-sm rounded pb-2">
                    <Link href={`/crypto/${coin.code}`} className='w-1/2 inline-block'>
                      <p className="text-gray-400 text-xs">Avg/Market price</p>
                      <p>{formatNumber(coin.avg_price) || '-'}</p>
                      <p>{formatNumber(coin.marketPrice)}</p>
                    </Link>
                    <Link href={`/crypto/${coin.code}`} className='w-1/2 inline-block'>

                      <p className="text-gray-400 text-xs">Total investes/Est val</p>
                      <p>{formatNumber(coin.total_invested, 2) || 0} / {formatNumber(coin.estVal, 2)}</p>
                      <p className={coin.isProfit ? `text-teal-500` : 'text-red-500'}>
                        {formatNumber(coin.profit, 2)} / {formatNumber(coin.profitPercentage, 2)}%</p>
                    </Link>
                    <div className="grid gap-1 text-right">
                      {/* <p className="text-gray-400 text-xs">Actions</p> */}
                      <CoinModal coin={coin} userId={user?.id} />
                      <CoinDeleteModal id={coin.id} userId={user?.id} />
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
