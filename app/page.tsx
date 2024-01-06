import { cmcHeaders } from '@/helpers/header-helper';
import supabase from '@/utils/supabase';
import { currentUser } from '@clerk/nextjs';
import { CoinListing } from '@/components/coins/listing';
import { ICoinDashboard } from '@/interfaces';
import { profitToIcon } from '@/helpers/string-helper';

export default async function Home() {
  const clerkUser = await currentUser();
  const {data: users, error} = await supabase.from('users').select().eq('userid', clerkUser?.id).limit(1);
  
  const { data: coins } = await supabase.from('coins').select().eq('userid', clerkUser?.id).order('name', { ascending: true });;
  const allCmcIds = coins?.map((coin) => (coin?.cmc_id));
  const { data: marketQuote } = await fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${allCmcIds?.join(',')}&convert=USD&aux=is_active`, {
    mode: 'cors',
    headers: cmcHeaders,
  }).then((res) => res.json()).catch(err => {
    console.log(err);
  });
  // console.log('marketQuote', marketQuote);
  
  const items: ICoinDashboard[] = coins?.map((coin) => {
    const marketPrice = marketQuote?.[coin.cmc_id.toString()]?.quote?.USD?.price;
    const estVal = marketPrice * (coin.total_amount || 0);
    const profit = estVal - coin.total_invested;
    const profitPercentage = coin.total_invested < 1 ? 0 :
    (estVal - coin.total_invested) / coin.total_invested * 100 || 0;
    // tha troi: total_invested < 1,
    const coinDashboard: ICoinDashboard = {
      ...coin,
      marketPrice,
      avg_price: coin.total_invested < 1 ? 0 : coin.avg_price,
      estVal: marketPrice * (coin.total_amount || 0),
      isProfit: coin.avg_price < marketPrice,
      profit,
      profitPercentage,
    }
    return {
      ...coinDashboard,
      profitToIcon: profitToIcon(users?.[0]?.noti_sell, coinDashboard),
    } as ICoinDashboard;
  }) || [];
  return (
    <CoinListing
      userid={clerkUser?.id}
      items={items}
      initialFund={users?.[0]?.initial_fund || 0}
    />
  )
}
