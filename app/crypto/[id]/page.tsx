import { formatDate } from "@/helpers/time-helper";
import supabase from "@/utils/supabase"
import { currentUser } from '@clerk/nextjs'
import Link from "next/link";
import { ITransaction, ETransactionType, TPlatformColor } from '../../../interfaces';
import { TransactionModal } from "./transaction-modal";
import { DeleteTransactionModal } from "./delete-transaction-modal";
import { formatNumber } from "@/helpers/number-helper";
import { UploadTransactionModal } from './upload-transaction-modal';
import { DeleteAllTransactionModal } from "./delete-all-transaction";
import { HeaderPage } from "@/components/header.page";
import { convertToCmcLink } from "@/helpers/string-helper";
export const revalidate = 0


const headers = new Headers({
  'X-CMC_PRO_API_KEY': process.env.NEXT_PUBLIC_CMC_KEY || '',
});

export default async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  const { data: coin } = await supabase.from('coins').select()
    .eq('userid', user?.id)
    .eq('id', params.id)
    .limit(1).single();
  const { data: transactions } = await supabase.from('transactions').select()
    .eq('userid', user?.id)
    .eq('coin', coin?.id)
    .order('tnx_date', { ascending: true });
  const totalAmount = transactions?.reduce((accumulator, tnx: ITransaction) => accumulator + tnx.amount, 0);
  const totalInvested = transactions?.reduce((accumulator, tnx: ITransaction) => accumulator + tnx.total, 0);
  const isThaTroi = totalInvested < 1;
  const avgPrice = isThaTroi ? 0 : totalInvested / totalAmount;
  const { data: marketQuote } = await fetch(
    `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${coin?.cmc_id}&convert=USD&aux=is_active`, {
    mode: 'cors',
    headers,
  }).then((res) => res.json());
  const marketPrice = marketQuote?.[coin.cmc_id.toString()]?.quote?.USD?.price;
  const profit = totalAmount * marketPrice - totalInvested;
  const estVal = totalAmount * marketPrice;
  return (
    <>
      <HeaderPage>
        <p className="text-center uppercase">
          <Link href={convertToCmcLink(coin.cmc_name)} target="_blank" className="hover:text-teal-500">
            {formatNumber(totalAmount, 2)} {coin.name}
          </Link>
          <br />
          <span className="text-xs text-gray-400">
            {coin.cmc_name}
          </span>
        </p>
      </HeaderPage>
      <div className='w-full'>
        <div className="flex p-2 gap-2 mt-2">
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Market price</h2>
            <p>{formatNumber(marketPrice)}</p>
          </div>
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Total invested</h2>
            <p>{isThaTroi ? 0 : formatNumber(totalInvested)}</p>
          </div>
          <div className='w-1/2 text-center'>
            <h2 className={`text-xs text-gray-400`}>Profit/Lost</h2>
            <p className={`${profit > 0 ? 'text-teal-400' : 'text-red-400'}`}>{formatNumber(profit)}</p>
          </div>
        </div>
        <div className="flex p-2 gap-2">
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Avg price</h2>
            <p>{isThaTroi ? 0 : formatNumber(avgPrice)}</p>
          </div>
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">Est val</h2>
            <p> <span>{formatNumber(estVal)}</span></p>
          </div>
          <div className='w-1/2 text-center'>
            <h2 className="text-xs text-gray-400">% Profit/Loss</h2>
            <p className={`${profit > 0 ? 'text-teal-400' : 'text-red-400'}`}>
              <span>{ isThaTroi ? 'G' : formatNumber((estVal - totalInvested)* 100 / totalInvested, 2) + '%'}</span>
            </p>
          </div>
        </div>
      </div>
      <div className='mt-2'>
        <div className=''>
          <p className="text-xs text-gray-400">History</p>
          <div className="flex flex-wrap gap-2">
            <div className="">
              <TransactionModal coin={coin} transactions={transactions || []} isOpen={false} />
            </div>
            <div>
              <UploadTransactionModal userid={user?.id || ''} />
            </div>
            {
              !!transactions?.length && (
                <div>
                  <DeleteAllTransactionModal coin={coin} />
                </div>
              )
            }
          </div>
        </div>
      </div>
      <p className="hidden">
        <span className="bg-yellow-500">B</span>
        <span className="bg-slate-500">O</span>
        <span className="bg-blue-500">M</span>
      </p>
      <div className="list">
        <div className='w-full'>
          {
            transactions?.map((tnx: ITransaction) =>
            (
              <div key={tnx?.id} className="border-b-2 border-slate-100">
                <div className="flex align-items-center mt-2 items-center">
                  <span className={
                    `py-px px-2 rounded-sm inline-block capitalize text-xs bg-opacity-50 font-medium ${tnx.type === ETransactionType.BUY ? 'bg-teal-200 text-teal-500' : 'bg-red-200 text-red-500'}`}>
                    {tnx.type}
                  </span>
                  <span className={
                    `py-px px-1 rounded-sm inline-block capitalize text-xs bg-opacity-50 font-medium ${TPlatformColor[tnx.platform]} ml-2 text-white`}>
                    {tnx.platform.charAt(0)}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">{formatDate(tnx.tnx_date)}</span>
                </div>
                <div className="flex items-center text-sm p-2 rounded space">
                  <div className='w-1/3'>
                    <p className="text-gray-400 text-xs">Amount</p>
                    <p className="">{formatNumber(tnx.amount)}</p>
                  </div>
                  <div className='w-1/3'>
                    <p className="text-gray-400 text-xs">Price</p>
                    <p className="">{formatNumber(tnx.price_at)}</p>
                  </div>
                  <div className='w-1/3'>
                    <p className="text-gray-400 text-xs">Total</p>
                    <p className="">{formatNumber(tnx.total, 2)}</p>
                  </div>
                  <div className="w-24 text-right">
                    <p className="text-gray-400 text-xs">Actions</p>
                    <div className="mt-1">
                      <TransactionModal coin={coin} transactions={transactions || []} isOpen={false} transaction={tnx} />
                      <DeleteTransactionModal id={tnx?.id || -1} coin={coin} transactions={transactions} />
                    </div>
                  </div>
                </div>
              </div>
            )
            )
          }
          {
            transactions?.length === 0 && (
              <div className="text-center">
                <h3 className="mt-4 text-lg font-semibold">No transactions added</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                  You have not added any transactions. Add one or upload above.
                </p>
              </div>
            )
          }
        </div>
      </div>
    </>
  )
}