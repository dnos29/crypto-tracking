import { cmcHeaders } from '@/helpers/header-helper';
import supabase from '@/utils/supabase';
import { currentUser } from '@clerk/nextjs';
import { CoinListing } from '@/components/coins/listing';
import { ICoinDashboard, IUser } from '@/interfaces';
import { profitToIcon } from '@/helpers/string-helper';
import { percentageProfit } from '@/helpers/calculater-helper';
import { dateRange, getDefaultTime } from '@/helpers/time-helper';
import dayjs from 'dayjs';
import { getDataSet } from '@/helpers/number-helper';

const PROFIT_THRESHOLD = 1;
export default async function Home() {
  const clerkUser = await currentUser();
  // clerkUser?.emailAddresses?.[0]?.emailAddress
  const {data, error} = await supabase.from('users').select().eq('userid', clerkUser?.id).limit(1);
  const user: IUser = data?.[0];
  const { data: coins } = await supabase.from('coins').select().eq('userid', clerkUser?.id).order('name', { ascending: true });
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
    const total_invested = coin.total_invested > PROFIT_THRESHOLD ? coin.total_invested : 0;
    const profit = estVal - total_invested; // whether include total_invested < 0
    const profitPercentage = percentageProfit(user.percentage_profit_formula, total_invested, estVal);
    // tha troi: total_invested < 1,
    const coinDashboard: ICoinDashboard = {
      ...coin,
      total_invested,
      marketPrice,
      avg_price: coin.total_invested <= PROFIT_THRESHOLD ? 0 : coin.avg_price,
      estVal: marketPrice * (coin.total_amount || 0),
      isProfit: coin.avg_price < marketPrice,
      profit,
      profitPercentage,
    }
    return {
      ...coinDashboard,
      profitToIcon: profitToIcon(user?.noti_sell, coinDashboard),
    } as ICoinDashboard;
  }) || [];

  const {data: totalSnapshots} = await supabase.from('total_snapshots')
    .select()
    .eq('userid', clerkUser?.id)
    .lte('created_at', getDefaultTime().toISOString())
    .gte('created_at', getDefaultTime().add(-30, 'day').toISOString())
    .order('snapshot_date', { ascending: false });

  const labels = dateRange(getDefaultTime().add(-1, 'day').toDate());
  const estValDataset = getDataSet(labels, totalSnapshots || [], 'snapshot_date', 'est_value');
  const estValNRemainDataset = getDataSet(labels, totalSnapshots || [], 'snapshot_date', 'est_value_n_remain');

  return (
    <CoinListing
      userid={clerkUser?.id}
      items={items}
      initialFund={user?.initial_fund || 0}
      userEmail={clerkUser?.emailAddresses?.[0]?.emailAddress}
      labels={labels}
      datasets={[
        {data: estValDataset, label: 'Est value'},
        {data: estValNRemainDataset, label: 'Est value + remain'}
      ]}
    />
  )
}
