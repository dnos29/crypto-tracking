import { formatDate } from "@/helpers/time-helper";
import supabase from "@/utils/supabase"
import { currentUser } from '@clerk/nextjs'
import Link from "next/link";
import {ITransaction, TPlatformColor, ETransactionType} from '../../../interfaces';
import { CryptoModal } from "./modal";
import { averageCoinPrice } from "@/helpers/calculater-helper";
import { useRouter } from "next/navigation";
import { CryptoDeleteModal } from "./delete-modal";
import { formatNumber } from "@/helpers/number-helper";
export const revalidate = 0


const headers = new Headers({
  'X-CMC_PRO_API_KEY': process.env.NEXT_PUBLIC_CMC_KEY || '',
});

export default async function Page({params}: {params: {id: string}}){
  const user = await currentUser();
  // const router = useRouter();
  const {data: coin} = await supabase.from('coins').select().eq('userId', user?.id).eq('code', params.id?.toUpperCase()).limit(1).single();
  const {data: transactions} = await supabase.from('transactions').select()
    .eq('userId', user?.id)
    .eq('coin', coin?.id)
    .order('created_at', { ascending: true });
  const totalAmount = transactions?.reduce((accumulator, tnx: ITransaction) => accumulator + tnx.amount, 0);
  const totalInvested = transactions?.reduce((accumulator, tnx: ITransaction) => accumulator + tnx.total, 0);
  const isThaTroi = totalInvested < 1;
  const avgPrice = isThaTroi ? 0 : totalInvested / totalAmount;
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
        <p className="text-center uppercase"> {formatNumber(totalAmount, 2)} {params.id}</p>
        <div className="w-14"></div>
      </div>
      <div className='w-full'>
        <div className="flex p-2 gap-2">
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Market price</h2>
            <p>{formatNumber(marketPrice)}</p>
          </div>
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Total invested</h2>
            <p>{isThaTroi ? 0 : formatNumber(totalInvested)}</p>
          </div>
        </div>
        <div className="flex p-2 gap-2">
        <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Avg price</h2>
            <p>{isThaTroi ? 0 : formatNumber(avgPrice)}</p>
          </div>
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Est val</h2>
            <p> <span>{formatNumber(totalAmount * marketPrice)}</span></p>
          </div>
        </div>
      </div>
      <CryptoModal coin={coin} transactions={transactions || []} isOpen={false} />
      <div className='mt-2'>
        <p className=''>History</p>
      </div>
      <div className="list">
          <div className='w-full'>
            <div className="flex text-xs text-gray-400 p-2">
              <div className='w-32'>Date</div>
              <div className='w-10'><span className="text-teal-500">Buy</span>/<span className="text-red-500">Sell</span></div>
              <div className='w-1/4 text-right'>Amount</div>
              <div className='w-1/4 text-right'>Price</div>
              <div className='w-20 text-right'>Platform</div>
              <div className='w-24 text-right'>Action</div>
            </div>
            {
              transactions?.map((tnx: ITransaction) => 
                (
                  <div key={tnx.id} className={`flex items-center text-sm mb-2 p-2 rounded ${tnx.type === ETransactionType.SELL ? 'bg-pink-100' : 'bg-teal-50'}`}>
                    <div className='w-32'>{formatDate(tnx.tnx_date)}</div>
                    <div className={`w-10 capitalize ${tnx.type === ETransactionType.BUY ? 'text-teal-500' : 'text-red-500'}`}>{tnx.type}</div>
                    <div className='w-1/4 text-right'>{tnx.amount}</div>
                    <div className='w-1/4 text-right'>{tnx.price_at}</div>
                    <div className='w-20 text-right'>
                      <span className={`capitalize text-white rounded p-1 ${TPlatformColor[tnx.platform]}`}>{tnx.platform.charAt(0)}</span>
                    </div>
                    <div className="w-24 text-right">
                      
                      <CryptoModal coin={coin} transactions={transactions || []} isOpen={false} transaction={tnx} />
                      <CryptoDeleteModal id={tnx?.id || -1} coin={coin} transactions={transactions} />
                    </div>
                  </div>
                )
              )
            }
          </div>
      </div>
      {/* Modal */}
      
    </>
  )
}