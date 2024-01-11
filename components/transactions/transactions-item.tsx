import { formatNumber } from "@/helpers/number-helper";
import { formatDate } from "@/helpers/time-helper";
import { ETransactionType, ITransactionCoin } from "@/interfaces"
import Link from "next/link";

interface ITransactionItemProps{
  transaction: ITransactionCoin,
}
export const TransactionItem = (props: ITransactionItemProps) => {
  const {transaction} = props;
  return (
    <div key={transaction?.id} className="border-b-2 border-slate-100 mt-2">
      <div className="text-sm flex gap-1 items-center font-medium">
        <div>
          <Link href={`/crypto/${transaction.coin.id}`}>
            {transaction.coin.name}
            <span className="text-gray-400 mx-2">{transaction.coin.cmc_name}</span>
            <span className='text-gray-400'>&gt;</span>
          </Link>
        </div>
      </div>
      <div className="flex align-items-center items-center mt-1">
        <span className={
          `py-px px-2 rounded-sm inline-block capitalize text-xs bg-opacity-50 font-medium ${transaction.type === ETransactionType.BUY ? 'bg-teal-200 text-teal-500' : 'bg-red-200 text-red-500'}`}>
          {transaction.type}
        </span>
        <span className={
          `py-px px-1 rounded-sm inline-block capitalize text-xs bg-opacity-50 font-medium bg-slate-500 ml-2 text-white`}>
          {transaction.platform.charAt(0)}
        </span>
        <span className="text-xs text-gray-400 ml-2">{formatDate(transaction.tnx_date)}</span>
      </div>
      <div className="flex items-center text-sm py-1 rounded space">
        <div className='w-1/2'>
          <p className="text-gray-400 text-xs">Amount</p>
          <p className="">{formatNumber(transaction.amount)}</p>
        </div>
        <div className='flex-1'>
          <p className="text-gray-400 text-xs">Price</p>
          <p className="">{formatNumber(transaction.price_at)}</p>
        </div>
        <div className='w-1/3 text-right'>
          <p className="text-gray-400 text-xs">Total</p>
          <p className="">{formatNumber(transaction.total, 2)}</p>
        </div>
      </div>
    </div>
  )
}