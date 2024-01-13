'use client';

import { DATE_FORMAT, formatDate } from "@/helpers/time-helper";
import { ITransaction } from "@/interfaces";
import supabase from "@/utils/supabase";

export const TransactionsDownload = (props: {userid: string}) => {
  const handleDownloadTransactions = async () => {
    const {data: transactions} = await supabase.from('transactions')
      .select()
      .eq('userid', props.userid)
      .order('cmc_id', {ascending: true})
      .order('tnx_date', {ascending: true});
    if(!!transactions?.length){
      const csvContent = 'data:text/csv;charset=utf-8,' +
        'cmc_id,type,platform,tnx_date,total,amount,coin\n' +
        transactions.map((transaction: ITransaction) => (
          `${transaction.cmc_id},${transaction.type},${transaction.platform},${formatDate(new Date(transaction.tnx_date), DATE_FORMAT.YYYY_MM_DD)},${transaction.total},${transaction.amount}`
        )).join('\n');
        const encodeUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodeUri);
        link.setAttribute('download', `transactions-${formatDate(new Date(), DATE_FORMAT.YYYY_MM_DD)}.csv`);
        document.body.appendChild(link);
        link.click();

    }else{
      alert('Coins not found');
    }
  }
  
  return (
    <>
      <p onClick={() => handleDownloadTransactions()}>Download transactions (.csv)</p>
    </>
  )
}