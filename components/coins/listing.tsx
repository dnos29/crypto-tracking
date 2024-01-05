'use client';
import { cmcHeaders, supabaseHeaders } from '@/helpers/header-helper';
import { ICoin, ICoinDashboard, ITransaction } from '@/interfaces';
import { useQuery, useIsFetching } from '@tanstack/react-query';
import { CoinModal } from './coin-modal';
import { formatNumber } from '@/helpers/number-helper';
import Link from 'next/link';
import { CoinDeleteModal } from './delete-modal';
import { UploadCoinModal } from './upload-coin-modal';
import { UploadTransactionModal } from '@/app/crypto/[id]/upload-transaction-modal';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { profitToTextColor } from '@/helpers/string-helper';

interface ICoinListingProps {
  userid?: string,
  items?: ICoinDashboard[],

}
export const CoinListing = (props: ICoinListingProps) => {
  // const {data} = await supabase.from('coins').select().order('name', { ascending: true }); asc, desc
  const [sortBy, setSortBy] = useState<{[key: string]: 'asc' | 'desc'}>();
  const [searchTerm, setSearchTerm] = useState('');
  const { userid, items } = props;
  const [dashboardItems, setDashboardItems] = useState(items || []);
  const totalProfitVal = items?.reduce((acc, coin) => acc + coin.profit, 0) || 0;
  const totalEstVal = items?.reduce((acc, coin) => acc + coin.estVal, 0) || 0;
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e?.target?.value;
    setSearchTerm(term);
    filterItems(term);
  }
  const handleSort = (key: string) => {
    const newDirection = sortBy?.[key] === 'asc' ? 'desc' : 'asc';
    setSortBy({
      [key]: newDirection,
    })
    filterItems(searchTerm, {
      [key]: newDirection,
    })
  }

  const filterItems = (name: string, sortBy?: {[key: string]: 'asc' | 'desc'}) => {
    setTimeout(() => {
      if(name === ''){
        setDashboardItems(items || []);
      }else{
        setDashboardItems([...items?.filter(item => item.name.toLowerCase().includes(name.toLowerCase())) || []]);
      }
      console.log(sortBy)
      if(sortBy?.name){
        setDashboardItems([...dashboardItems?.sort((item1, item2) => {
          if(sortBy?.name === 'asc'){
            return item1.name.localeCompare(item2.name);
          }else{
            return item2.name.localeCompare(item1.name);
          }
        }) || []]);
      }
      if(sortBy?.profit || sortBy?.profitPercentage){
        const key = Object.keys(sortBy)[0] as keyof ICoinDashboard;
        setDashboardItems([...dashboardItems?.sort((item1, item2) => {
          if(sortBy?.[key] === 'asc'){
            return (Number(item1?.[key]) - Number(item2?.[key]));
          }else{
            return (Number(item2?.[key]) - Number(item1?.[key]));
          }
        }) || []]);
      }
    }, 500);
  }
  // useEffect(() => {
  //   const filterItems = setTimeout(() => {

  //   }, 5000);
  // }, [searchTerm]);

  return (
    <>
      <div className='mt-4'>
        Hi there!
        <p className='text-xs	mt-4'>
          Est total/profit value (USDT)
        </p>
        <p className={`${profitToTextColor(totalProfitVal)}`}>
          <span className='text-2xl font-bold'>{formatNumber(totalEstVal, 2)}</span>
          <span className='text-2xl'> - </span>
          <span className={`text-2xl font-bold`}>{formatNumber(totalProfitVal, 2)}</span>
        </p>
        <div className='mt-2'>
          <div className='flex gap-2'>
          <span className='text-sm'>Assets</span>
            <div><CoinModal userid={userid || ''} /></div>
            <div><UploadCoinModal userid={userid || ''} /></div>
            <div><UploadTransactionModal userid={userid || ''} /></div>
          </div>
          <div className="flex gap-2 mt-2">
            <span className='text-sm'>Sort by</span>
            <div className=''>
              <button
                className=" px-2 text-sm bg-blue-200 rounded"
                onClick={() => handleSort('name')}
              >
                Name {sortBy?.name == 'desc' && (<span className='text-sm'>&#9650;</span>)} {sortBy?.name == 'asc' && (<span className='text-sm'>&#9660;</span>)}
              </button>
            </div>
            <div className=''>
              <button
                className=" px-2 text-sm bg-blue-200 rounded"
                onClick={() => handleSort('profit')}
              >
                Profit {sortBy?.profit == 'desc' && (<span className='text-sm'>&#9650;</span>)} {sortBy?.profit == 'asc' && (<span className='text-sm'>&#9660;</span>)}
              </button>
            </div>
            <div className=''>
              <button
                className=" px-2 text-sm bg-blue-200 rounded"
                onClick={() => handleSort('profitPercentage')}
              >
                Percentage {sortBy?.profitPercentage == 'desc' && (<span className='text-sm'>&#9650;</span>)} {sortBy?.profitPercentage == 'asc' && (<span className='text-sm'>&#9660;</span>)}
              </button>
            </div>
          </div>
          <div className='my-2 flex gap-1'>
            <Input placeholder='Search by name' value={searchTerm} onChange={handleSearch} />
          </div>
          <div className="list">
            <div className='w-full'>
              {
                dashboardItems?.map((coin: any) => (
                  <div key={coin.id} className="border-b-2 border-slate-100 mt-2">
                    <div className="flex justify-between">
                      <div className='text-sm w-32 grid items-center font-medium'><div>{coin.name} - {formatNumber(coin.total_amount || 0, 2)}</div></div>
                    </div>
                    <div className="flex text-sm rounded pb-2">
                      <Link href={`/crypto/${coin.code}`} className='w-1/2 inline-block'>

                        <p className="text-gray-400 text-xs">Total invested/Est val</p>
                        <p>
                          { coin.total_invested < 0 ? 0 : formatNumber(coin.total_invested, 2) || 0} 
                          / {formatNumber(coin.estVal, 2)}
                        </p>
                        <p className={profitToTextColor(coin.profit)}>
                          {
                            coin.total_invested < 1 ? (
                              <>
                                {formatNumber(coin.profit, 2)} / -
                              </>
                            ) : (
                              <>
                                {formatNumber(coin.profit, 2)} / {formatNumber(coin.profitPercentage, 2)}%
                              </>
                            )
                          }
                        </p>
                      </Link>
                      <Link href={`/crypto/${coin.code}`} className='w-1/2 inline-block'>
                        <p className="text-gray-400 text-xs">Avg/Market price</p>
                        <p className={`${(coin.avg_price === 0 && coin.profit > 0) && 'text-teal-500'}`}>
                          {(coin.avg_price === 0 && coin.profit > 0) ? 'G': formatNumber(coin.avg_price) || '-'}
                        </p>
                        <p>{formatNumber(coin.marketPrice)}</p>
                      </Link>
                      <div className="grid gap-1 text-right">
                        {/* <p className="text-gray-400 text-xs">Actions</p> */}
                        <CoinModal coin={coin} userid={userid} />
                        <CoinDeleteModal id={coin.id} userid={userid} />
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}