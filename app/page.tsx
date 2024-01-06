import { cmcHeaders } from '@/helpers/header-helper';
import supabase from '@/utils/supabase';
import { currentUser } from '@clerk/nextjs';
import { CoinListing } from '@/components/coins/listing';
import { ICoinDashboard } from '@/interfaces';

export default async function Home() {
  const clerkUser = await currentUser();
  const {data: users, error} = await supabase.from('users').select().eq('userid', clerkUser?.id).limit(1);
  
  const { data: coins } = await supabase.from('coins').select().eq('userid', clerkUser?.id).order('name', { ascending: true });;
  const allSymbols = coins?.map((coin) => (coin?.code.toUpperCase()));
  const { data: marketQuote } = await fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${allSymbols?.join(',')}&convert=USD`, {
    mode: 'cors',
    headers: cmcHeaders,
  }).then((res) => res.json()).catch(err => {
    console.log(err);
  });
  
  const items: ICoinDashboard[] = coins?.map((coin) => {
    const marketPrice = marketQuote?.[coin.code.toUpperCase()]?.[0]?.quote?.USD?.price;
    const estVal = marketPrice * (coin.total_amount || 0);
    // lai: total_invested >= 1, estVal > total_invested
    // tha troi: total_invested < 1, 
    return {
      ...coin,
      marketPrice,
      avg_price: coin.total_invested < 1 ? 0 : coin.avg_price,
      estVal: marketPrice * (coin.total_amount || 0),
      isProfit: coin.avg_price < marketPrice,
      profit: estVal - coin.total_invested,
      profitPercentage: coin.total_invested < 1 ? 0 :(estVal - coin.total_invested) / coin.total_invested * 100 || 0,
    } as ICoinDashboard;
  }) || [];
  return (
    <CoinListing
      userid={clerkUser?.id}
      items={items}
      initialFund={users?.[0]?.initial_fund || 0}
      noti_sell={users?.[0]?.noti_sell}
    />
  )
}
