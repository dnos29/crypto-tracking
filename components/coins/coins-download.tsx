'use client';

import { DATE_FORMAT, formatDate } from "@/helpers/time-helper";
import { ICoin } from "@/interfaces";
import supabase from "@/utils/supabase";

export const CoinsDownload = (props: {userid: string}) => {
  const handleDownloadCoins = async () => {
    const {data: coins} = await supabase.from('coins')
      .select()
      .eq('userid', props.userid)
      .order('name', {ascending: true});
    if(!!coins?.length){
      const csvContent = 'data:text/csv;charset=utf-8,' +
        'cmc_id,cmc_name,cmc_symbol,cmc_slug,name,total_invested,total_amount,avg_price\n' +
        coins.map((coin: ICoin) => (
          `${coin.cmc_id},${coin.cmc_name},${coin.cmc_symbol},${coin.cmc_slug},${coin.name},${coin.total_invested.toString()},${coin.total_amount.toString()},${coin?.avg_price?.toString()}`
        )).join('\n');
        const encodeUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodeUri);
        link.setAttribute('download', `coins-${formatDate(new Date(), DATE_FORMAT.YYYY_MM_DD)}.csv`);
        document.body.appendChild(link);
        link.click();

    }else{
      alert('Coins not found');
    }
  }
  
  return (
    <>
      <p onClick={() => handleDownloadCoins()}>Download coins (.csv)</p>
    </>
  )
}